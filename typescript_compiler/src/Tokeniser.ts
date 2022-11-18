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