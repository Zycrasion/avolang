import is from "./charTests.js";
import { AssertType, AssertValue, FunctionCallToken, IdentifierToken, isFunctionCallToken, isIdentiferToken, isIdentifierDerativeToken, isOperatorToken, isPunctuationToken, isValueToken, IToken, KeywordToken, OperatorToken, PunctuationToken, ValueToken, ValueTypes } from "./TokenTypes.js";

export class Tokeniser
{
    content: string[];
    p1_index: number;
    pass1: IToken[];
    p2_index: number;
    pass2: IToken[];
    p3_index: number;
    final: IToken[];

    constructor(content: string)
    {
        this.content = content.split("");
        this.p1_index = 0;
        this.p2_index = 0;
        this.p3_index = 0;
    }

    private P1_Current(): string
    {
        return this.content.at(this.p1_index);
    }

    private P1_Peek(): string
    {
        return this.content.at(this.p1_index + 1);
    }

    private P1_Next(): string
    {
        return this.content.at(++this.p1_index);
    }

    private P1_ParseNum(curr: string): ValueToken
    {
        let numStr = curr;
        let isFloat = false;
        let next = this.P1_Peek();
        while (is.digit(next) || next == ".")
        {
            if (next == ".")
            {
                if (isFloat) { break; }
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
        let type: ValueTypes = isFloat ? "Float" : "Int";

        return new ValueToken(
            type,
            num
        )
    }

    private P1_ParseId(curr: string): IdentifierToken | KeywordToken
    {
        let id = curr;
        let next = this.P1_Next();
        while (is.identifier.tail(next))
        {
            id = id.concat(next);
            next = this.P1_Peek();
            this.P1_Next();
        }
        this.p1_index--;

        if (is.keyword(id))
        {
            return new KeywordToken(id);
        }
        return new IdentifierToken(id);
    }

    private P1_ParseString(curr : string) : ValueToken
    {
        let txt = "";
        let next = this.P1_Next();
        while (next != curr)
        {
            txt = txt.concat(next.toString());
            next = this.P1_Next();
        }
        return new ValueToken(
            curr == "'" ? "Char" : "String",
            txt
        )
    }

    private P1_ParseAtom(curr: string): IToken
    {
        if (curr.length != 1)
        {
            throw new Error("TOKEN SIZE MUST BE 1");
        }

        if (is.digit(curr))
        {
            return this.P1_ParseNum(curr);
        }

        if (curr == '"' || curr == "'")
        {
            return this.P1_ParseString(curr);
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

    /**
     * Groups strings together into basic groups
     * @returns Tokens
     */
    RunPass1(): IToken[]
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


    private P2_Current(): IToken
    {
        return this.pass1.at(this.p2_index);
    }

    private P2_Peek(): IToken
    {
        return this.pass1.at(this.p2_index + 1);
    }

    private P2_Next(): IToken
    {
        return this.pass1.at(++this.p2_index);
    }

    private P2_ScanFunctionCall(curr: IdentifierToken): FunctionCallToken
    {
        let name = curr.value;
        let params: IToken[] = [];
        this.P2_Next();
        let next = this.P2_Next();
        loop: while (next !== undefined)
        {
            if (isPunctuationToken(next))
            {
                if (next.value === ")") break;
                // if (next.value === ",")
                // {
                //     next = this.P2_Next();
                //     continue loop;
                // }
            }
            params.push(this.P2_ParseToken(next));
            next = this.P2_Next();
        }
        return new FunctionCallToken(
            name,
            params
        )
    }

    private P2_ParseToken(curr: IToken)
    {
        if (isIdentiferToken(curr))
        {
            let next = this.P2_Peek()
            if (isPunctuationToken(next) && next.value == "(")
            {
                return this.P2_ScanFunctionCall(curr);
            }
        }
        return curr;
    }

    /**
     * Groups Related Tokens Together into more complex tokens
     * @returns Tokens
     */
    RunPass2()
    {
        this.pass2 = [];
        while (this.P2_Current() !== undefined)
        {
            let token = this.P2_ParseToken(this.P2_Current());
            this.pass2.push(token);
            this.P2_Next();
        }
        return this.pass2;
    }

    private P3_Main(tokens : IToken[])
    {
        let final = [];
        loop: for (let i = 0; i < tokens.length; i++)
        {

            let curr = tokens[i];
            if (isFunctionCallToken(curr))
            {
                curr.params = this.P3_Main(curr.params);
            }
            if (i + 1 < tokens.length)
            {
                let next = tokens[i + 1];
                if (isOperatorToken(next))
                {
                    final.push(next, curr);
                    i++;
                    continue loop;
                } 
            }
            final.push(curr);
        }
        return final
    }

    /**
     * Converts normal Math into polish notation
     * @returns Tokens
     */
    RunPass3()
    {
        this.final = this.P3_Main(this.pass2)
        return this.final;
    }

    Run()
    {
        this.RunPass1();
        this.RunPass2();
        return this.RunPass3();
    }
}