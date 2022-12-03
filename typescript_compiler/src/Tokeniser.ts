import is from "./charTests.js";
import { IdentifierToken, IToken, KeywordToken, OperatorToken, PunctuationToken, ValueToken, ValueTypes } from "./TokenTypes.js";

class Tokeniser
{
    content : string[];
    p1_index : number;
    pass1 : IToken[];
    pass2 : IToken[];
    final : IToken[];

    constructor(content : string)
    {
        this.content = content.split("");
        this.p1_index = 0;
    }

    private P1_Current() : string
    {
        return this.content.at(this.p1_index);
    }

    private P1_Peek() : string
    {
        return this.content.at(this.p1_index + 1);
    }

    private P1_Next() : string
    {
        return this.content.at( ++ this.p1_index);
    }

    private P1_ParseNum(curr : string) : ValueToken
    {
        let numStr = curr;
        let isFloat = false;
        let next = this.P1_Peek();
        while (is.digit(next) || next == ".")
        {
            if (next == ".")
            {
                if (isFloat) {break;}
                isFloat = true;
                numStr = numStr.concat(next);
            } else 
            {
                // Its a number
                numStr = numStr.concat(next);
            }

            this.P1_Next();
            next = this.P1_Peek();
        }

        let num = parseFloat(numStr);
        let type : ValueTypes = isFloat ? "Float" : "Int";
        
        return new ValueToken(
            type,
            num
        )
    }

    private P1_ParseId(curr : string) : IdentifierToken | KeywordToken
    {
        let id = curr;
        let next = this.P1_Next();
        while (is.identifier.tail(next))
        {
            id = id.concat(next);
            next = this.P1_Next();
        }

        if (is.keyword(id))
        {
            return new KeywordToken(id);
        }
        return new IdentifierToken(id);
    }

    private P1_ParseAtom(curr : string) : IToken
    {
        if (curr.length != 1)
        {
            throw new Error("TOKEN SIZE MUST BE 1");
        }

        if (is.digit(curr))
        {
            return this.P1_ParseNum(curr);
        }

        if (is.punctuation(curr))
        {
            return new PunctuationToken(curr);
        }

        if (is.operator(curr))
        {
            return new OperatorToken(curr);
        }

        if (is.identifier.start(curr))
        {
            return this.P1_ParseId(curr);
        }
        return null;
    }
    
    RunPass1() : IToken[]
    {
        this.pass1 = [];
        while (this.P1_Current() !== undefined)
        {
            let token = this.P1_ParseAtom(this.P1_Current());
            if (token != null)
            {
                this.pass1.push(token);
            }
            this.P1_Next();
        }
        return this.pass1;
    }

    RunPass2()
    {
    
    }

    RunPass3()
    {

    }

    Run()
    {
        this.RunPass1();
    }
}

{
    let content = "var : int a = 10 + 10;";
    let TokenFactory = new Tokeniser(content);
    let result = TokenFactory.RunPass1();
    console.log(
        JSON.stringify(result)
    )
}