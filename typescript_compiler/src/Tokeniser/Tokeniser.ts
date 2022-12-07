import is from "../charTests.js";
import { TokeniserPass } from "./Pass.js";
import { StringPass } from "./Pass1.js";
import { AssertType, AssertValue, FunctionCallToken, IdentifierToken, isFunctionCallToken, isIdentiferToken, isIdentifierDerativeToken, isOperatorToken, isPunctuationToken, isValueToken, IToken, KeywordToken, OperatorToken, PunctuationToken, ValueToken, ValueTypes } from "./TokenTypes.js";

export class Tokeniser
{
    private Pass1: TokeniserPass;
    p2_index: number;
    pass2: IToken[];
    p3_index: number;
    final: IToken[];

    constructor(content: string)
    {
        this.Pass1 = new StringPass(content);
        this.p2_index = 0;
        this.p3_index = 0;
    }

    // TODO: Remove these and replace them


    // TODO: Seperate Pass 2
    private P2_Current(): IToken
    {
        return this.Pass1.result.at(this.p2_index);
    }

    private P2_Peek(): IToken
    {
        return this.Pass1.result.at(this.p2_index + 1);
    }

    private P2_Next(): IToken
    {
        return this.Pass1.result.at(++this.p2_index);
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

    // TODO: Seperate Pass3
    private P3_Main(tokens: IToken[])
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
        this.Pass1.Run();
        this.RunPass2();
        return this.RunPass3();
    }
}