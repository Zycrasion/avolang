import { AvoTypes, KeywordToAvotype } from "../AvoGlobals.js";
import { FunctionCallToken, IdentifierToken, isFunctionCallToken, isIdentiferToken, isKeywordToken, isOperatorToken, isPunctuationToken, isScopeToken, isValueToken, IToken, KeywordToken, OperatorToken, ScopeToken, ValueToken } from "../Tokeniser/TokenTypes.js";
import { TokenFilter } from "./Filter.js";
import { ExpressionNode, FunctionCallNode, IdentifierNode, INode, KeywordNode, ScopeNode, ValueNode, VariableDeclarationNode } from "./NodeTypes.js";

interface OperatorPrecedence
{
    "+": number,
    "-": number,
    "/": number,
    "*": number
}

const BasicPrecedence: OperatorPrecedence = {
    "+": 10,
    "-": 10,
    "/": 20,
    "*": 20
}

function IsValidOperator(op: string): op is keyof OperatorPrecedence
{
    return op in BasicPrecedence
}

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
        if (this.index >= this.tokens.length)
        {
            console.error("Tried to peek past length");
            return this.current;
        }
        let __temp__ = this.tokens.at(++this.index);
        if (__temp__ == undefined) throw new Error("Requested More Tokens Than Available")
        return this.current = __temp__
    }

    peek(): IToken
    {
        if (this.index >= this.tokens.length)
        {
            console.error("Tried to peek past length");
            return this.current;
        }
        let __temp__ = this.tokens.at(this.index + 1);
        if (__temp__ == undefined) throw new Error("Requested More Tokens Than Available")
        return this.current = __temp__
    }

    end(): boolean
    {
        return this.index >= this.tokens.length
    }

    create_expression(op_tok: OperatorToken): ExpressionNode
    {
        console.log(op_tok)
        let op = op_tok.value;

        let lhs = this.parse_token(this.next());
        console.debug(lhs)
        let rhs = this.parse_token(this.next());

        if (!IsValidOperator(op))
        {
            throw new Error(`Operator ${op} not a real operator`)
        }

        if (INode.isExpressionNode(rhs))
        {
            if (!(IsValidOperator(rhs.operator)))
            {
                throw new Error("RHS does not have a valid operator")
            }
    
            // re-orders so this expression is rhs's expression
            if (BasicPrecedence[op] > BasicPrecedence[rhs.operator])
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
        }


        return new ExpressionNode(
            lhs,
            op,
            rhs
        )
    }

    create_function(token: FunctionCallToken): FunctionCallNode
    {
        let separated: IToken[][] = [[]];
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

        let params: INode[] = [];

        for (let nested of separated)
        {
            let parser = new Parser(nested);
            let nodes = parser.read();
            params.push(...nodes);
        }

        return new FunctionCallNode(token.name, params);
    }

    identifier_dispatch(current: IdentifierToken): INode
    {
        return new IdentifierNode(current.value);
    }

    create_variable(current: KeywordToken): VariableDeclarationNode
    {
        let colon = this.next();
        if (!(isPunctuationToken(colon) && colon.value == ":")) throw new Error("UNEXPECTED TOKEN!");

        let type = this.parse_token(this.next());
        if (!INode.isKeywordNode(type)) throw new Error("UNEXPECTED TOKEN!");

        let name = this.parse_token(this.next());
        if (!INode.isIdentifierNode(name)) throw new Error("UNEXPECTED TOKEN!");

        let eq = this.next();
        if (!(isPunctuationToken(eq) && eq.value == "=")) throw new Error("UNEXPECTED TOKEN!");

        let value = this.parse_token(this.next());
        return new VariableDeclarationNode(
            KeywordToAvotype(type.kw) as AvoTypes,
            name.id,
            value
        )
    }

    keyword_dispatch(current: KeywordToken): INode
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

    value_token_dispatch(current: ValueToken): INode
    {
        return new ValueNode(
            current.type,
            current.value
        )
    }

    parse_token(token: IToken): INode
    {
        if (isOperatorToken(token)) return this.create_expression(token);

        if (isIdentiferToken(token)) return this.identifier_dispatch(token);

        if (isKeywordToken(token)) return this.keyword_dispatch(token);

        if (isValueToken(token)) return this.value_token_dispatch(token);

        if (isScopeToken(token)) return this.scope_token(token);

        if (isFunctionCallToken(token)) return this.create_function(token);

        throw new Error(`Token ${token} isn't recognised`)
    }

    scope_token(current: ScopeToken): ScopeNode
    {
        let parser = new Parser(current.tokens);

        return new ScopeNode(
            parser.read()
        )
    }

    parse_delimited(begin: TokenFilter, seperator: TokenFilter, end: TokenFilter): INode[]
    {
        if (!TokenFilter.evaluate(begin, this.current))
        {
            throw new Error("EXPECTED BEGINNING TOKEN");
        }

        let delimited: INode[] = [];

        while (!TokenFilter.evaluate(end, this.peek()))
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

    read(): INode[]
    {
        let nodes: INode[] = [];
        let a = this.parse_token(this.current);
        nodes.push(a);
        while (this.index + 1 < this.tokens.length)
        {
            this.next();
            let a = this.parse_token(this.current);
            nodes.push(a);
        }

        return nodes;
    }
}