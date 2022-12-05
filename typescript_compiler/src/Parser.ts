import { FunctionCallToken, isIdentiferToken, isKeywordToken, isPunctuationToken, isValueToken, IToken } from "./TokenTypes.js";
import { isOperatorToken } from "./TokenTypes.js";
export class Parser
{
    private tokens: IToken[];

    public current: IToken;
    public index: number;

    constructor(tokens: IToken[])
    {
        this.tokens = tokens;
        this.index = 0;
        this.current = tokens[this.index];
    }

    next(): IToken
    {
        return this.current = this.tokens.at(this.index++);
    }

    peek(): IToken
    {
        let tok = this.tokens.at(this.index++);
        this.index--;
        return tok;
    }

    putback(): IToken
    {
        return this.current = this.tokens.at(this.index--);
    }

    end(): boolean
    {
        return this.index >= this.tokens.length;
    }

    parse_keyword(token: IToken = this.current): INode
    {
        if (!isKeywordToken(token)) throw new Error("Expected keyword token");
        switch (token.value)
        {
            case "var":
                let colon = this.next()
                if (!isPunctuationToken(colon)) throw new Error("Expected punc token after var")
                if (colon.value != ":")
                {
                    throw new Error("NO : AFTER VAR");
                } else
                {
                    let type = this.parse_keyword(this.next());
                    let name = this.grab_id(this.next());
                    let eq = this.next();
                    if (!isPunctuationToken(eq)) throw new Error("Expected =");
                    if (eq.value != "=") { throw new Error("NO =") }
                    let value = this.parse_token(this.next());

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

    parse_num(token: IToken = this.current): INode
    {
        if (!isValueToken(token)) throw new Error("Expected Value Token");
        if (!token.isNumber()) throw new Error("Expected Number Token");
        return Node.createLeaf(token.isFloat() ? "Float" : "Int",  token.value);
    }

    /**
     * Parses Polish Notation into AST
     * @param operator Main operator
     */
    parse_expr(operator: IToken = this.current): Node
    {
        console.log(operator)
        const op_prec = {
            "+" : 10,
            "-" : 10, 
            "*" : 20,
            "/" : 20
        }
        if (!isOperatorToken(operator)) throw new Error("Parameter passed to parse_expr isn't an operator", {cause: operator});
        let op = operator.value;
        let lhs = this.parse_token(this.next());
        let rhs = this. parse_token(this.next());
        if (op_prec[rhs.value] < op_prec[op])
        {
            let _op = op;
            let _lhs = Object.assign({}, lhs);
            let _rhs = Object.assign({}, rhs);
            let r_rhs = Object.assign({}, (rhs as Node).right);
            let r_lhs = Object.assign({}, (rhs as Node).left);

            op = rhs.value;
            lhs = r_rhs as INode; 

            rhs.value = _op;
            (rhs as Node).left = _lhs as Node;
            (rhs as Node).right = r_lhs as Node;
        }
        return Node.create(
            "Expression",
            op,
            lhs,
            rhs
        )
    }

    parse_id(token: IToken = this.current): INode
    {

        if (!isIdentiferToken(token))
        {
            throw new Error("ERROR NOT ID", { cause: token })
        }

        return Node.createLeaf("Identifier", token.value);
    }

    grab_id(token: IToken = this.current): string
    {
        if (!isIdentiferToken(token))
        {
            throw new Error("ERROR NOT ID", { cause: token })
        }
        return token.value;
    }

    parse_string(token: IToken = this.current): INode
    {
        if (isValueToken(token) && token.isStringType())
        {
            return Node.createLeaf(token.isString() ? "StringLiteral" : "CharLiteral", token.value);
        }
        throw new Error("TOKEN NOT STRING OR CHAR");
    }

    parse_delimited(start: string, separator: string, endString: string): INode[]
    {
        let nodes: INode[] = [];
        let starter = this.next();
        if (!(isPunctuationToken(starter) && starter.value == start))
        {
            throw new Error("UNEXPECTED TOKEN " + JSON.stringify(this.current));
        }


        loop:
        while (!(isPunctuationToken(this.current) && this.current.value == endString))
        {
            this.next()

            if (isPunctuationToken(this.current) && this.current.value == separator)
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

    parse_func(token : FunctionCallToken) : FunctionNode
    {
        let seperated : IToken[][] = [[]];
        for (let t of token.params)
        {   
            if (isPunctuationToken(t) && t.value == ",")
            {
                seperated.push([]);
            } else 
            {
                seperated[seperated.length - 1].push(t);
            }
        }

        let params : INode[] = [];
        for (let nested of seperated)
        {
            let parser = new Parser(nested);
            let nodes = parser.read() ;
            params.push(...nodes);
        }

        return FunctionNode.create(
            "FunctionCall",
            token.name,
            params
        )
    }

    parse_token(token: IToken = this.current): INode
    {
        switch (token.tokenName)
        {
            case "KeywordToken":
                return this.parse_keyword(token);

            case "FunctionCallToken":
                return this.parse_func(token as FunctionCallToken);

            case "PunctuationToken":
                break;

            case "IdentifierToken":
                return this.parse_id(token);

            case "ValueToken":
                if (!isValueToken(token)) throw new Error("This Should be impossible");
                if (token.isNumber())
                {
                    return this.parse_num(token);
                } else if (token.isStringType())
                {
                    return this.parse_string(token);
                }

            case "OperatorToken":
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