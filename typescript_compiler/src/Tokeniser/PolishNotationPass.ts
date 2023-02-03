import { TokeniserPass } from "./Pass.js";
import { isFunctionCallToken, isOperatorToken, isScopeToken, IToken } from "./TokenTypes.js";

export class PolishNotationPass implements TokeniserPass
{
    private index: number;
    private pass: IToken[];
    private current: IToken;
    private content: IToken[];
    private hasRun: boolean;

    get result()
    {
        if (!this.hasRun) this.Run();
        this.hasRun = true;
        return this.pass;
    }

    constructor(content: IToken[])
    {
        this.hasRun = false;
        this.content = content;
        this.index = 0;
        this.current = { "tokenName": "undefined" }
        this.Curr();
        this.pass = [];
    }

    private Curr()
    {
        let __temp__ = this.content.at(this.index);
        if (__temp__ == undefined) throw new Error("Tried to access object out-of-bounds")
        return this.current = __temp__;
    }

    private Peek()
    {
        let __temp__ = this.content.at(this.index + 1);
        if (__temp__ == undefined) throw new Error("Tried to access object out-of-bounds")
        return this.current = __temp__;
    }

    private Next()
    {
        let __temp__ = this.content.at(++this.index);
        if (__temp__ == undefined) throw new Error("Tried to access object out-of-bounds")
        return this.current = __temp__;
    }

    private MainDispatch(tokens: IToken[])
    {
        let final : IToken[] = [];
        for (let i = 0; i < tokens.length; i = final.length)
        {
            let curr = tokens[i];

            if (isFunctionCallToken(curr))
            {
                curr.params = this.MainDispatch(curr.params);
            }

            if (isScopeToken(curr))
            {
                curr.tokens = this.MainDispatch(curr.tokens)
            }

            // First, check if the next token is an operator, 1 * 2
            //                                                 ^
            // if it is then move the operator in front of it * 1 2
            
            if (i + 1 < tokens.length && isOperatorToken(tokens[i + 1]))
            {
                final.push(tokens[i + 1], tokens[i])
            } else 
            {
                final.push(tokens[i])
            }

        }
        return final
    }

    /**
     * Converts normal Math into polish notation
     * @returns Tokens
     */
    Run()
    {
        this.pass = this.MainDispatch(this.content)
        return this.pass;
    }
}