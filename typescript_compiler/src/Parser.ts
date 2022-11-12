import is from "./charTests.js";

export class Token
{
    type: string;
    value: any;

    static create(type: string, value: any)
    {
        let a = new Token();
        a.type = type;
        a.value = value;
        return a;
    }

    static createBlank = (type: string) => this.create(type, null);
}

export class Tokeniser
{

    private content: string;

    public current: string;
    public index: number;

    constructor(content: string)
    {
        this.content = content;
        this.index = 0;
        this.current = content.at(this.index);
    }


    end(): boolean
    {
        return this.index >= this.content.length
    }

    putback(): string
    {
        return this.current = this.content.at(this.index--);
    }

    next(): string
    {
        return this.current = this.content.at(this.index++);
    }

    read_id()
    {
        let id = this.current;
        while (is.identifier.tail(this.next()) && !this.end())
        {
            id += this.current;
        }

        this.putback();

        return Token.create(
            is.keyword(id) ? "keyword" : "identifier",
            id
        )
    }

    read_num()
    {
        let num = this.current;
        let hasDecimalPlace = false;
        while ((is.digit(this.next()) || this.current == ".") && !this.end())
        {
            if (this.current == ".")
            {
                if (hasDecimalPlace) { break; }
                hasDecimalPlace = true;
            }
            num += this.current;
        }
        this.putback();
        return Token.create(
            hasDecimalPlace ? "float" : "int",
            parseFloat(num)
        )
    }

    read_until(char: string)
    {
        let str = "";
        while (this.next() != char && !this.end())
        {
            str += this.current;
        }
        return str;
    }

    read(): Token[]
    {
        let tokens: Token[] = [];
        while (!this.end())
        {
            this.next();
            if (this.current == "'" || this.current == '"')
            {
                tokens.push(Token.create(this.current == '"' ? "string" : "char", this.read_until(this.current)))
            }
            else if (is.punctuation(this.current))
            {
                tokens.push(Token.create("punc", this.current));
            } else if (is.identifier.start(this.current))
            {
                tokens.push(this.read_id());
            } else if (is.operator(this.current))
            {
                tokens.push(Token.create("operator", this.current));
            } else if (is.digit(this.current))
            {
                tokens.push(this.read_num());
            }
        }
        return tokens;
    }

}

export interface INode
{
    type : string;
    value : any;
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
    params : INode[];

    static create(type: string, value: any, params : INode[])
    {
        let a = new FunctionNode();
        a.type = type;
        a.value = value;

        a.params = params;
        return a;
    }

}

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
                return Node.createLeaf("Boolean", token.value === "true")

            case "int":
            case "float":
            case "bool":
            case "string":
            case "char":
                return Node.createLeaf("Type", token.value);

            default:
                throw new Error("Unrecognised keyword", { cause: token })
        }
        return null;
    }

    parse_num(token: Token = this.current) : INode
    {
        return Node.createLeaf(token.type, token.value);
    }

    // for example 10 * 10, parses to {left 10 right 10 type operator value multiply}
    parse_expr(token: Token = this.current, prec: number = 0): INode
    {
        const op_prec = {
            "+": 10,
            "-": 10,
            "*": 20,
            "/": 20
        }
        let left = this.parse_token(token);
        if (!this.end() && this.next().type == "operator")
        {
            let type = this.current.value;
            let right = this.parse_expr(this.next(), prec);
            if (op_prec[type] > prec)
            {
                return Node.create(
                    "Expression",
                    type,
                    left,
                    right
                )
            }
            return Node.create(
                "Expression",
                type,
                right,
                left
            )
        }
        return left;
    }

    grab_id(token: Token = this.current): string
    {
        if (token.type != "identifier")
        {
            throw new Error("ERROR NOT ID", { cause: token })
        }
        return token.value;
    }

    parse_id(token: Token = this.current): INode
    {
        if (token.type != "identifier")
        {
            throw new Error("ERROR NOT ID", { cause: token })
        }

        if (this.next().value == "(")
        {
            this.putback();
            return FunctionNode.create("FunctionCall", token.value, this.parse_delimited("(", ",", ")"))
        }

        return Node.createLeaf("Identifier", token.value);
    }

    parse_string(token : Token = this.current) : INode
    {
        if (token.type == "string" || token.type == "char")
        {
            return Node.createLeaf(token.type == "string" ? "StringLiteral" : "CharLiteral", token.value);
        }
        throw new Error("TOKEN NOT STRING OR CHAR");
    }

    parse_delimited(start : string, separator : string, endString : string) : INode[]
    {
        let nodes : INode[] = [];
        if (this.next().value != start)
        {
            throw new Error("UNEXPECTED TOKEN "+JSON.stringify(this.current));
        }


        loop:
        while(this.current.value !== endString)
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

    parse_token(token: Token = this.current): INode
    {
        switch (token.type)
        {
            case "keyword":
                return this.parse_keyword(token);

            case "punc":
                break;

            case "identifier":
                return this.parse_id(token);

            case "float":
            case "int":
                return this.parse_num(token);

            case "char":
            case "string":
                return this.parse_string(token);

            case "operator":
                return this.parse_expr(token);

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
            let a  = this.parse_token();
            if (a != null)
            {
                node.push(a);
            }
        }

        return node;
    }
}