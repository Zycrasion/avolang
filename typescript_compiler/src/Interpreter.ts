import { FunctionNode, INode, Node } from './Parser';
type ReturnTypes = "Int" | "Float" | "Char" | "Bool" | "String" | "Void"
type ParameterLength = number | "Infinite";
export class AvoVariable
{
    name: string;
    type: string;
    value: any;
}
export class AvoFunction
{
    returnType: string;
    callback: (...a: any) => any;
    pLength: ParameterLength;

    constructor(callback: (...a: any) => any, returnType: ReturnTypes, parameterLength : ParameterLength)
    {
        this.callback = callback;
        this.returnType = returnType;
        this.pLength = parameterLength;
    }

    call(args: any[])
    {
        return this.callback(...args);
    }

    static createFromAvo(Tree: INode[])
    {

    }
}

interface VariableTable
{
    [Name: string]: AvoVariable;
}

interface FunctionTable
{
    [Name: string]: AvoFunction;
}

export class Scope
{
    variables: VariableTable;
    functions: FunctionTable;
    current: INode;
    index: number;
    AST: INode[];

    constructor(AST: INode[])
    {
        this.variables = {};
        this.functions = {};
        this.index = -1;
        this.AST = AST;
        this.next();
    }

    next()
    {
        this.current = this.AST.at(this.index++);
        return this.current;
    }

    putback()
    {
        this.current = this.AST.at(this.index--);
        return this.current;
    }

    peek()
    {
        return this.AST.at(this.index + 1);
    }

    end()
    {
        return this.index >= this.AST.length;
    }

    scream(msg: string)
    {
        throw new Error(msg, { cause: JSON.stringify(this.current) })
    }

    grab_id(id: string) 
    {
        if (id in this.variables)
        {
            return { type: this.variables[id].type, value: this.variables[id].value };
        } else 
        {
            return null;
        }
    }

    eval_expr(node: Node): { type: string, value: number }
    {

        let op = node.value;
        let left = this.eval_node(node.left as Node);
        let right = this.eval_node(node.right as Node);
        if (left.type != right.type) this.scream("TYPE MISMATCH");
        let result = 0;
        switch (op)
        {
            case "*":
                result = left.value * right.value
                break;
            case "+":
                result = left.value + right.value
                break;
            case "-":
                result = left.value - right.value
                break;
            case "/":
                result = left.value / right.value
                break;
            default:
                this.scream("UNRECOGNISED OPERATION")
        }
        return { type: left.type, value: result }
    }

    // i know specifying return type like this is bad practice but im lazy
    eval_function_call(node: FunctionNode): { type: string, value: number }
    {
        if (node.value in this.functions)
        {
            let func = this.functions[node.value];
            if (!(func.pLength == "Infinite" || func.pLength == node.params.length)) 
            {
                this.scream(`PARAMETER LENGTH MISMATCH EXPECTED ${func.pLength} RECIEVED ${node.params.length}`)
            }

            let result = this.functions[node.value].call(node.params.map(v =>
            {
                return this.eval_node(v).value;
            }));
            return { type: this.functions[node.value].returnType, value: result}
        }
        else 
        {
            this.scream("FUNCTION NOT DEFINED");
        }
    }

    eval_node(node: INode = this.current): { type: string, value: number }
    {
        if (node==null) 
        {
            this.scream("NULL TOKEN");
        }
        switch (node.type)
        {
            case "FunctionCall":
                return this.eval_function_call(node as FunctionNode);

            case "Expression":
                return this.eval_expr(node as Node);

            case "Int":
            case "Float":
            case "CharLiteral":
            case "Char":
            case "Bool":
            case "String":
            case "StringLiteral":
                return { type: node.type, value: node.value };

            case "Identifier":
                return this.grab_id(node.value);

            case "VariableDeclaration":
                let VariableRaw = (this.current as Node);

                let Variable = new AvoVariable();

                Variable.type = VariableRaw.left.value;
                Variable.name = VariableRaw.value;

                let value = this.eval_node(VariableRaw.right) as { type: string, value: any };
                if (value.type != Variable.type) this.scream(["TYPE MISMATCH", value.type, Variable.type].join(" "))
                Variable.value = value.value;

                this.variables[this.current.value] = Variable;
                return { type: Variable.type, value: Variable.value }

            default:
                this.scream("UNRECOGNISED TOKEN ".concat(JSON.stringify(node)))
        }
    }

    walk()
    {
        while (!this.end() && this.next())
        {
            this.eval_node();
        }
        delete this.current;
        delete this.index;
        delete this.AST;
    }
}