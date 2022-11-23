import is from "./charTests.js";

interface IToken
{
    type : string;
    value : any;
}

export class Token implements IToken
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

export class FunctionCallToken implements IToken
{
    type: string;
    value: any;
    params : Token[];

    static create(name : any, params : Token[]) : FunctionCallToken
    {
        let a = new FunctionCallToken();
        a.type = "FunctionCall";
        a.value = name;
        a.params = params;

        return a;
    }
}

export class FunctionDeclarationToken implements IToken
{
    type: string;
    value: any;
    params : Token[];
    body : Token[];
    return_type : Token;

    static create(name : any, params : Token[], body : Token[], return_type : Token) : FunctionDeclarationToken
    {
        let a = new FunctionDeclarationToken();
        a.type = "FunctionDeclaration";
        a.value = name;
        a.params = params;
        a.body = body;
        a.return_type = return_type

        return a;
    }
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

    peek(): string
    {
        return this.content.at(this.index);
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

        if (is.keyword(id) && id == "func")
        {
            return this.read_func_decl();
        }

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

    assure_type(type : string)
    {
        let tok = this.read_token(null, () => {});
        if (tok.type != type)
        {
            throw new Error("EXPECTED TOKEN TYPE OF ".concat(type, " GOT ", tok.type, "  ", JSON.stringify(tok)), {cause : JSON.stringify(tok)});
        }
        return tok;
    }

    assure_value(value : string)
    {
        let tok = this.read_token(null, () => {});
        if (tok.value != value)
        {
            throw new Error("EXPECTED TOKEN VALUE OF ".concat(value, " GOT ", tok.value, "  ", JSON.stringify(tok)), {cause : JSON.stringify(tok)});
        }
        return tok;
    }

    read_func_decl() : IToken
    {

        // func : void scream ( hi , lol )
        // {
        //      out.print("AJJJJJGGG ",hi," ",lol)
        // }
        this.putback();
        console.log(this.current);
        this.assure_value(":");
        this.next();
        let return_type = this.assure_type("keyword");
        this.next();
        let name = this.assure_type("identifier");
        this.assure_value("(");
        this.next();
        
        let paramNames : Token[] = [];
        let current : Token = this.read_token(null, () => {paramNames.pop()});
        while (current.value != ")")
        {
            paramNames.push(current);
            this.next();
            current = this.read_token(current, () => {paramNames.pop()})
        }

        this.assure_value("{")
        this.next();
        let body : IToken[] = []
        current = this.read_token(null, () => {body.pop()})
        while (current.value != "}")
        {
            body.push(current);
            this.next();
            current = this.read_token(current, () => {body.pop()})
        }

        return FunctionDeclarationToken.create(
            name,
            paramNames,
            body,
            return_type
        );
    }

    read_func_call(FuncIdentifer : Token) : IToken
    {
        let name = FuncIdentifer.value;
        let params : Token[] = [];
        let last = Token.create("punc", "(");
        while (this.next() != ")")
        {
            params.push(this.read_token(last, () => {params.pop()}));
            last = params[params.length - 1];
        }
        return FunctionCallToken.create(name, params);
    }

    read_token(last : Token, remove_last : () => void) : IToken
    {
        if (this.current == " ") {this.next()}
        if (this.current == "'" || this.current == '"')
        {
            return Token.create(this.current == '"' ? "string" : "char", this.read_until(this.current))
        }
        else if (is.punctuation(this.current))
        {
            if (this.current == "(" && last.type == "identifier")
            {
                remove_last();
                return this.read_func_call(last);
            }
            return Token.create("punc", this.current);
        } else if (is.identifier.start(this.current))
        {
            return this.read_id();
        } else if (is.operator(this.current))
        {
            return Token.create("operator", this.current);
        } else if (is.digit(this.current))
        {
            return this.read_num();
        }
        return null;
    }

    /**
     * Main dispatcher
     * @returns the Tokens
     */
    read(): IToken[]
    {
        let tokens: IToken[] = [];
        function remove_last()
        {
            tokens.pop();
        }
        while (!this.end())
        {
            this.next();
            let curr;
            if (tokens.length == 0)
            {
                curr = this.read_token(null, remove_last);
            } else 
            {
                curr = this.read_token(tokens[tokens.length - 1], remove_last);
            }

            if (curr == null)
            {
                continue;
            } else 
            {
                tokens.push(curr);
            }
        }
        return tokens;
    }
    
    /**
     * utility function for ```convert_to_pn()```
     * @param expr_stack stack to compute polish notation for
     * @returns 
     */
    private pn_parse_stack(expr_stack : IToken[]) : IToken[]
    {
        let pn : IToken[] = [];
        if (expr_stack.length > 1 && expr_stack[1].type == "operator")
        {
            pn.push(expr_stack[1], expr_stack[0], ...this.pn_parse_stack(expr_stack.slice(2)));
            return pn;
        }
        else
        {
            return [expr_stack[0]];
        }
    }

    /**
     * Converts tokens to polish notation
     * @param tokens Tokens to convert to polish notation
     */
    convert_to_pn(tokens : IToken[])
    {
        let pn : IToken[] = [];
        // 2, -, 3
        let expr_stack : IToken[] = [];
        // - 2 3
        for (let index = 0; index < tokens.length; index++)
        {
            let current = tokens[index];
            switch (current.type)
            {
                case "int":
                case "float":
                case "identifier":
                case "operator":
                    expr_stack.push(current);
                    break;

                case "FunctionCall":
                    (current as FunctionCallToken).params = this.convert_to_pn((current as FunctionCallToken).params);
                    expr_stack.push(current);
                    break;

                default:
                    if (expr_stack.length > 0)
                    {
                        pn.push(...this.pn_parse_stack(expr_stack));  
                        expr_stack = [];    
                    }
                    pn.push(current)
            }
        }
        if (expr_stack.length > 0)
        {
            pn.push(...this.pn_parse_stack(expr_stack));  
            expr_stack = [];    
        }
        return pn;
    }

}