import { INode, Node } from './Parser';

export class AvoVariable
{
    name : string;
    type : string;
    value : any;
}

export class AvoFunction
{
    callback : (...a : any) => any;
    constructor(callback : (...a : any) => any)
    {
        this.callback = callback;
    }

    call(args : any[])
    {
        this.callback(...args);
    }

    static createFromAvo(Tree : INode[])
    {

    }
}

interface VariableTable
{
    [Name : string] : AvoVariable;
}

export class Scope
{
    variables : VariableTable;
    current : INode;
    index : number;
    AST : INode[];

    constructor(AST : INode[])
    {
        this.variables = {};
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

    scream(msg : string)
    {
        throw new Error(msg, {cause : JSON.stringify(this.current)})
    }

    grab_id(id : string) 
    {
        if (id in this.variables)
        {
            return {type:this.variables[id].type , value:this.variables[id].value};
        } else 
        {
            return null;
        }
    }

    eval_node(node : INode = this.current)
    {
        switch(node.type)
        {
            case "Int":
            case "Float":
            case "Char":
            case "Bool":
            case "String":
                return {type:node.type, value:node.value};

            case "Identifier":
                return this.grab_id(node.value);

            case "VariableDeclaration":
                let VariableRaw = (this.current as Node);

                let Variable = new AvoVariable();

                Variable.type = VariableRaw.left.value;
                Variable.name = VariableRaw.value;

                let value = this.eval_node(VariableRaw.right) as {type : string, value : any};
                if (value.type != Variable.type) this.scream(["TYPE MISMATCH",value.type,Variable.type].join(" "))
                Variable.value = value.value;

                // if (VariableRaw.right.type == "Identifier")
                // {
                //     let id = this.grab_id(VariableRaw.right.value);
                //     if (id==null) this.scream("IDENTIFIER IS NOT DECLARED");
                //     if (id.type != Variable.type) this.scream("TYPE MISMATCH")

                //     Variable.value = id.value;
                // } else 
                // {
                //     if (VariableRaw.right.type != Variable.type) this.scream("TYPE DOESN'T MATCH");
                //     Variable.value = VariableRaw.right.value;
                // }


                this.variables[this.current.value] = Variable;
                return {type : Variable.type, value : Variable.value}

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