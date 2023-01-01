import { AvoTypes, KeywordToAvotype } from "../AvoGlobals.js";
import { FunctionCallToken, IdentifierToken, isFunctionCallToken, isIdentiferToken, isKeywordToken, isOperatorToken, isPunctuationToken, isValueToken, IToken, KeywordToken, OperatorToken, ValueToken } from "../Tokeniser/TokenTypes.js";
import { TokenFilter } from "./Filter.js";
import { ExpressionNode, FunctionCallNode, IdentifierNode, INode, KeywordNode, ValueNode, VariableDeclarationNode } from "./NodeTypes.js";

export class Parser
{
    private tokens : IToken[];
    
    public current: IToken;
    public index : number;

    constructor(tokens : IToken[])
    {
        this.tokens = tokens;
        this.index= 0;

        this.current = tokens[this.index];
    }

    next() : IToken
    {
        return this.current = this.tokens.at(++this.index);
    }

    peek(): IToken
    {
        return this.current = this.tokens.at(this.index + 1);
    }

    end() : boolean
    {
        return this.index >= this.tokens.length
    }

    create_expression(op_tok : OperatorToken) : ExpressionNode
    {
        let op_prec = 
        {
            "+" : 10,
            "-" : 10,
            "*" : 20,
            "/" : 20
        };

        let op = op_tok.value;
        let lhs = this.parse_token(this.next());
        let rhs = this.parse_token(this.next());

        // re-orders so this expression is rhs's expression
        if (INode.isExpressionNode(rhs) && op_prec[op] > op_prec[rhs.operator])
        {
            let _op = rhs.operator;
            let _lhs = Object.assign({}, lhs)
            
            let r_rhs = Object.assign({}, rhs.right);
            let r_lhs = Object.assign({}, rhs.left);

            op = rhs.operator;
            rhs.operator = _op;

            lhs = r_lhs;
            rhs.left = _lhs;
            rhs.right = r_rhs;
        }

        return new ExpressionNode(
            lhs,
            op,
            rhs
        )
    }

    create_function(token : FunctionCallToken) : FunctionCallNode
    {
        let separated : IToken[][] = [[]];
        for (let par of token.params)
        {
            if (isPunctuationToken(par) && par.value == ",")
            {
                separated.push([]);
            } else 
            {
                separated[separated.length - 1].push(par);
            }
        }

        let params : INode[] = [];

        for (let nested of separated)
        {
            let parser = new Parser(nested);
            let nodes = parser.read();
            params.push(...nodes);
        }

        return new FunctionCallNode(token.name, params);
    }

    identifier_dispatch(current : IdentifierToken) : INode
    {
        return new IdentifierNode(current.value);
    }

    create_variable(current : KeywordToken) : VariableDeclarationNode
    {
        let colon = this.next();
        if (!(isPunctuationToken(colon) && colon.value == ":")) throw new Error("UNEXPECTED TOKEN!");
        
        let type = this.parse_token(this.next());
        if (!INode.isKeywordNode(type)) throw new Error("UNEXPECTED TOKEN!");
        
        let name = this.parse_token(this.next());
        if (!INode.isIdentifierNode(name)) throw new Error("UNEXPECTED TOKEN!");

        let eq = this.next();
        if (!(isPunctuationToken(eq)&&eq.value == "=")) throw new Error("UNEXPECTED TOKEN!");

        let value = this.parse_token(this.next());
        return new VariableDeclarationNode(
            KeywordToAvotype(type.kw) as AvoTypes,
            name.id,
            value
        )
    }

    keyword_dispatch(current : KeywordToken) : INode
    {
        if (current.value == "true" || current.value == "false")
        {
            return new ValueNode(
                "Boolean",
                current.value
            )
        }

        if (current.value == "var")
        {
            return this.create_variable(current);
        }

        return new KeywordNode(
            current.value
        )
    }

    value_token_dispatch(current : ValueToken) : INode
    {
        return new ValueNode(
            current.type,
            current.value
        )
    }

    parse_token(token : IToken) : INode
    {        
        if (isOperatorToken(token)) return this.create_expression(token);
    
        if (isIdentiferToken(token)) return this.identifier_dispatch(token);

        if (isKeywordToken(token)) return this.keyword_dispatch(token);

        if (isValueToken(token)) return this.value_token_dispatch(token);

        if (isFunctionCallToken(token)) return this.create_function(token);
    }

    parse_delimited(begin : TokenFilter, seperator : TokenFilter, end : TokenFilter): INode[]
    {
        if (!TokenFilter.evaluate(begin, this.current))
        {
            throw new Error("EXPECTED BEGINNING TOKEN");
        }

        let delimited : INode[] = [];

        while (!TokenFilter.evaluate(end,this.peek()))
        {
            this.next();
            if (TokenFilter.evaluate(seperator, this.current)) continue;

            delimited.push(
                this.parse_token(
                    this.current
                )
            );
        }
    
        return delimited;
    }

    read() : INode[]
    {
        let nodes : INode[] = [];
        while(!this.end())
        {
            let a = this.parse_token(this.current);
            if (a != null)
            {
                nodes.push(a);
            }
            this.next();
        }

        return nodes;
    }
}