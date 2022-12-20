import { KeywordToAvotype } from "./AvoGlobals.js";
import { INode, FunctionCallNode, ExpressionNode, VariableDeclarationNode } from "./Parser/NodeTypes.js";
type ReturnTypes = "Int" | "Float" | "Char" | "Bool" | "String" | "Void"
type ParameterLength = number | "Infinite";

export class AvoFunction
{
    returnType: string;
    callback: (...a: any) => any;
    pLength: ParameterLength;

    constructor(callback: (...a: any) => any, returnType: ReturnTypes, parameterLength: ParameterLength)
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
    [Name: string]: VariableDeclarationNode;
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
            return { type: KeywordToAvotype(this.variables[id].type), value: this.variables[id].value };
        } else 
        {
            return null;
        }
    }

    eval_expr(node: ExpressionNode): { type: string, value: number }
    {
        let op = node.operator
        if (node.left == undefined || node.right == undefined)
        {
            console.log(node);
            throw new Error("EXPRESSION IS BINARY, UNARY EXPRESSION PROVIDED")
        }
        let left = this.eval_node(node.left);
        let right = this.eval_node(node.right);
        if (left.type != right.type) this.scream(`EXPRESSION TYPE MISMATCH BETWEEN ${left.type} and ${right.type}`);
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
    eval_function_call(node: FunctionCallNode): { type: string, value: number }
    {
        if (node.name in this.functions)
        {
            let func = this.functions[node.name];
            if (!(func.pLength == "Infinite" || func.pLength == node.params.length)) 
            {
                this.scream(`PARAMETER LENGTH MISMATCH EXPECTED ${func.pLength} RECIEVED ${node.params.length}`)
            }

            let result = this.functions[node.name].call(node.params.map(v =>
            {
                let _ = this.eval_node(v).value
                console.log(_)
                return _;
            }));
            return { type: this.functions[node.name].returnType, value: result }
        }
        else 
        {
            this.scream("FUNCTION NOT DEFINED");
        }
    }

    eval_node(node: INode = this.current): { type: string, value: any }
    {
        if (node == null) 
        {
            this.scream("NULL TOKEN");
        }
        if (INode.isFunctionCallNode(node))
            return this.eval_function_call(node);

        if (INode.isExpressionNode(node))
            return this.eval_expr(node);

        if (INode.isValueNode(node))
            return { type: node.type, value: node.value };

        if (INode.isIdentifierNode(node))
            return this.grab_id(node.id);

        if (INode.isVariableDeclarationNode(node))
        {
            let Variable: VariableDeclarationNode = node;
            this.variables[Variable.name] = Variable;
            return { type: Variable.type, value: Variable.value }
        }

        this.scream("UNRECOGNISED TOKEN ".concat(JSON.stringify(node)))
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