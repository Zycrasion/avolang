import { Token } from "./Tokeniser";
export class Parser
{
    private tokens: Token[];

    public current: Token;
    public index: number;

    constructor(tokens: Token[])
    {
        this.tokens = tokens;
        this.index = 0;
        this.current = tokens[this.index];
    }

    next(): Token
    {
        return this.current = this.tokens.at(this.index++);
    }

    peek(): Token
    {
        let tok = this.tokens.at(this.index++);
        this.index--;
        return tok;
    }

    putback(): Token
    {
        return this.current = this.tokens.at(this.index--);
    }

    end(): boolean
    {
        return this.index >= this.tokens.length;
    }

    parse_keyword(token: Token = this.current): INode
    {
        switch (token.value)
        {
            case "var":
                if (this.next().value != ":")
                {
                    throw new Error("NO : AFTER VAR");
                } else
                {
                    let type = this.parse_keyword(this.next());
                    let name = this.grab_id(this.next());
                    if (this.next().value != "=") { throw new Error("NO =") }
                    let value = this.parse_expr(this.next());

                    return Node.create(
                        "VariableDeclaration",
                        name,
                        type,
                        value
                    )

                }

            case "func":
                break;

            case "true":
            case "false":
                return Node.createLeaf("Bool", token.value === "true")

            case "int":
            case "float":
            case "bool":
            case "string":
            case "char":
                let Localised = (token.value as string)
                Localised = Localised.at(0).toUpperCase() + Localised.slice(1);
                return Node.createLeaf("Type", Localised);

            default:
                throw new Error("Unrecognised keyword", { cause: token })
        }
        return null;
    }

    parse_num(token: Token = this.current, ExpressionDetection : boolean): INode
    {
        if (ExpressionDetection && this.peek().type == "operator")
        {
            return this.parse_expr(token)
        }
        return Node.createLeaf(token.type == "float" ? "Float" : "Int", token.value);
    }

    // for example 10 * 10, parses to {left 10 right 10 type operator value multiply}
    parse_expr(token: Token = this.current): INode
    {
        const op_prec = {
            "+": 10,
            "-": 10,
            "*": 20,
            "/": 20
        }

        let left = this.parse_token(token, false);
        // if (!(left.type == "Float" || left.type == "Int")) return left;
        if (left.type != "Float" && left.type != "Int") return left;
        let operator = this.parse_token(this.peek());
        if (operator == null || operator.type != "Operator")
        {
            return left;
        }
        this.next();
        let right = this.parse_token(this.next());
        
        return Node.create(
            "Expression",
            operator.value,
            left,
            right
        )
    }

    parse_id(token: Token = this.current, ExpressionDetection : boolean): INode
    {
        if (token.type != "identifier")
        {
            throw new Error("ERROR NOT ID", { cause: token })
        }

        if (ExpressionDetection && this.peek().type=="operator")
        {
            return this.parse_expr(token);
        }

        if (this.peek().value == ".")
        {
            this.next();
            let funcOrVar = this.parse_id(this.next(), false);
            funcOrVar.value = token.value + "." + funcOrVar.value;
            return funcOrVar;
        }

        if (this.peek().value == "(")
        {
            return FunctionNode.create("FunctionCall", token.value, this.parse_delimited("(", ",", ")"))
        }

        return Node.createLeaf("Identifier", token.value);
    }

    grab_id(token: Token = this.current): string
    {
        if (token.type != "identifier")
        {
            throw new Error("ERROR NOT ID", { cause: token })
        }
        return token.value;
    }

    parse_string(token: Token = this.current): INode
    {
        if (token.type == "string" || token.type == "char")
        {
            return Node.createLeaf(token.type == "string" ? "StringLiteral" : "CharLiteral", token.value);
        }
        throw new Error("TOKEN NOT STRING OR CHAR");
    }

    parse_delimited(start: string, separator: string, endString: string): INode[]
    {
        let nodes: INode[] = [];
        if (this.next().value != start)
        {
            throw new Error("UNEXPECTED TOKEN " + JSON.stringify(this.current));
        }


        loop:
        while (this.current.value !== endString)
        {
            this.next()
            
            if (this.current.value == separator)
            {
                continue loop;
            }

            let tok = this.parse_token();
            if (tok == null)
            {
                break;
            }

            nodes.push(tok);
        }


        return nodes;
    }

    parse_token(token: Token = this.current, ExpressionDetection = true): INode
    {
        switch (token.type)
        {
            case "keyword":
                return this.parse_keyword(token);

            case "punc":
                break;

            case "identifier":
                return this.parse_id(token, ExpressionDetection);

            case "float":
            case "int":
                return this.parse_num(token, ExpressionDetection);

            case "char":
            case "string":
                return this.parse_string(token);

            case "operator":
                return Node.createLeaf("Operator", token.value);

            default:
                throw new Error(`Unexpected Token .`, { cause: this.current })
        }
        return null;
    }

    read(): INode[]
    {
        let node: INode[] = [];

        while (!this.end())
        {
            this.next();
            let a = this.parse_token();
            if (a != null)
            {
                node.push(a);
            }
        }

        return node;
    }
}

export interface INode
{
    type: string;
    value: any;
}

export class Node implements INode
{
    type: string;
    value: any;
    left: INode;
    right: INode;

    static create(type: string, value: any, left: INode, right: INode)
    {
        let a = new Node();
        a.type = type;
        a.value = value;

        a.left = left;
        a.right = right;

        return a;
    }

    static createLeaf = (type: string, value: any) => this.create(type, value, null, null);
    static createUnary = (type: string, value: any, left: INode) => this.create(type, value, left, null);
}

export class FunctionNode implements INode
{
    type: string;
    value: any;
    params: INode[];

    static create(type: string, value: any, params: INode[])
    {
        let a = new FunctionNode();
        a.type = type;
        a.value = value;

        a.params = params;
        return a;
    }

}