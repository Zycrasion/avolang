import { AvoTypes, ConditionalTypes, KeywordToAvotype } from "../AvoGlobals.js";
import { FunctionCallToken, IdentifierToken, isFunctionCallToken, isIdentiferToken, isKeywordToken, isOperatorToken, isPunctuationToken, isScopeToken, isValueToken, IToken, KeywordToken, OperatorToken, PunctuationToken, ScopeToken, ValueToken } from "../Tokeniser/TokenTypes.js";
import { TokenFilter } from "./Filter.js";
import { ConditionalNode, ExpressionNode, FunctionCallNode, IdentifierNode, IfNode, INode, KeywordNode, ScopeNode, UnaryOperatorNode, ValueNode, VariableDeclarationNode } from "./NodeTypes.js";

const OperatorPrecedence =
{
    "+": 10,
    "-": 10,
    "*": 20,
    "/": 20
}

type SupportedOperator = keyof typeof OperatorPrecedence;

function isValidOperator(op: string): op is SupportedOperator
{
    return op in OperatorPrecedence
}

export class Parser
{
    private tokens: IToken[];

    public current: IToken | undefined;
    public index: number;

    constructor(tokens: IToken[])
    {
        this.tokens = tokens;
        this.index = 0;

        this.current = tokens[this.index];
    }

    next(): IToken | undefined
    {
        return this.current = this.tokens.at(++this.index);
    }

    next_filtered(): IToken
    {
        let a  = this.next();
        if (a === undefined) throw new Error("Expected Token Recieved Undefined");
        return a;
    }

    peek(): IToken | undefined
    {
        return this.current = this.tokens.at(this.index + 1);
    }

    peek_filtered(): IToken
    {
        let a  = this.peek();
        if (a === undefined) throw new Error("Expected Token Recieved Undefined");
        return a;
    }

    end(): boolean
    {
        return this.index >= this.tokens.length
    }

    create_expression(op_tok: OperatorToken): ExpressionNode | ConditionalNode
    {
        let op = op_tok.value;

        if (op == ">" || op == "<" || op.includes("="))
        {
            return this.conditional_parser(op_tok);
        }

        let lhs = this.parse_token(this.next());
        let rhs = this.parse_token(this.next());
        if (lhs == undefined || rhs == undefined) throw new Error("Undefined Token")

        // re-orders so this expression is rhs's expression
        if (INode.isExpressionNode(rhs) && isValidOperator(op) && isValidOperator(rhs.operator) && OperatorPrecedence[op] > OperatorPrecedence[rhs.operator])
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

        if (colon != undefined && !(isPunctuationToken(colon) && colon.value == ":")) throw new Error("UNEXPECTED TOKEN!");

        let type = this.parse_token(this.next());

        if (!INode.isKeywordNode(type)) throw new Error("UNEXPECTED TOKEN!");

        let name = this.parse_token(this.next());

        if (!INode.isIdentifierNode(name)) throw new Error("UNEXPECTED TOKEN!");

        let eq = this.next();

        if (eq != undefined && !(isPunctuationToken(eq) && eq.value == "=")) throw new Error("UNEXPECTED TOKEN!");

        let value = this.parse_token(this.next());

        return new VariableDeclarationNode(
            KeywordToAvotype(type.kw) as AvoTypes,
            name.id,
            value
        )
    }

    if_parser(current : KeywordToken, invert : boolean = false) : IfNode
    {
        let conditional = this.parse_token(this.next_filtered());
        if (invert && INode.isConditionalNode(conditional))
        {
            let a = new UnaryOperatorNode("!", conditional);
            conditional = a;
        }

        let scope = this.parse_token(this.next_filtered());
        if (!INode.isScopeNode(scope)) throw new Error("Expected Scope node!");

        let node = new IfNode(
            conditional,
            scope
        )

        let else_token = this.peek_filtered()
        if (isKeywordToken(else_token) && else_token.value == "else")
        {
            this.next()

            let else_scope = this.parse_token(this.next_filtered());
            if (!INode.isScopeNode(else_scope)) throw new Error("Expected Scope node!");
            node.else_scope = else_scope;
        }
     
        return node
    }

    keyword_dispatch(current: KeywordToken): INode
    {
        if (current.value == "true" || current.value == "false")
        {
            return new ValueNode(
                "Bool",
                current.value
            )
        }

        if (current.value == "if")
        {
            return this.if_parser(current);
        }

        if (current.value == "ifnot")
        {
            return this.if_parser(current, true);
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

    conditional_parser(token: OperatorToken): ConditionalNode
    {
        let op = token;
        let table = {
            ">" : ConditionalTypes.GT,
            "<" : ConditionalTypes.LT,
            ">=" : ConditionalTypes.GT_EQ,
            "<=" : ConditionalTypes.LT_EQ,
            "==" : ConditionalTypes.EQ,
            "!=" : ConditionalTypes.NEQ,
        }

        if (!(op.value in table)) throw new Error(`${op.value} is an urecognised conditional`);

        if (op.value in table)
        {
            return new ConditionalNode(
                table[op.value as keyof typeof table],
                this.parse_token(this.next()),
                this.parse_token(this.next()),
            )
        }

        throw new Error("Unrecognised token ".concat(JSON.stringify(token), " ", JSON.stringify(this.tokens)));
    }

    punctuation_dispatch(token: PunctuationToken): INode
    {
        if (token == undefined) throw new Error("Expected token, Recieved undefined!");

        throw new Error("Unrecognised token ".concat(JSON.stringify(token), " ", JSON.stringify(this.tokens)));
    }

    parse_token(token: IToken | undefined): INode
    {

        if (token == undefined) { throw new Error("Undefined Token!") }

        if (isOperatorToken(token)) return this.create_expression(token);

        if (isIdentiferToken(token)) return this.identifier_dispatch(token);

        if (isKeywordToken(token)) return this.keyword_dispatch(token);

        if (isValueToken(token)) return this.value_token_dispatch(token);

        if (isScopeToken(token)) return this.scope_token(token);

        if (isFunctionCallToken(token)) return this.create_function(token);

        if (isPunctuationToken(token)) return this.punctuation_dispatch(token);

        throw new Error("Unrecognised token ".concat(JSON.stringify(token), " ", JSON.stringify(this.tokens)));
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
        let beginToken = this.current;
        if (beginToken == undefined) throw new Error("Unexpected EOF");

        if (!TokenFilter.evaluate(begin, beginToken))
        {
            throw new Error("EXPECTED BEGINNING TOKEN");
        }

        let delimited: INode[] = [];


        let peeked = this.peek();
        if (peeked == undefined) throw new Error("Expected token");
        while (!TokenFilter.evaluate(end, peeked))
        {
            this.next();
            let curr = this.current;
            if (curr == undefined) throw new Error("Expected token");

            if (TokenFilter.evaluate(seperator, curr)) continue;

            let delimitedToken = this.parse_token(
                this.current
            );

            if (delimitedToken == undefined) throw new Error("Expected token");

            delimited.push(
                delimitedToken
            );
        }

        return delimited;
    }

    read(): INode[]
    {
        let nodes: INode[] = [];
        while (!this.end())
        {
            let a = this.parse_token(this.current);
            nodes.push(a);
            this.next();
        }

        return nodes;
    }
}