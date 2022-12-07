import { TokeniserPass } from "./Pass.js";
import { isFunctionCallToken, isOperatorToken, IToken } from "./TokenTypes.js";

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
        this.Curr();
        this.pass = [];
    }

    private Curr()
    {
        return this.current = this.content.at(this.index);
    }

    private Peek()
    {
        return this.current = this.content.at(this.index + 1);
    }

    private Next()
    {
        return this.current = this.content.at(++this.index);
    }

    private MainDispatch(tokens: IToken[])
    {
        let final = [];
        for (let i = 0; i < tokens.length; i++)
        {
            let curr = tokens[i];
            
            if (isFunctionCallToken(curr))
                curr.params = this.MainDispatch(curr.params);

            if (i + 1 < tokens.length && isOperatorToken(tokens[i+1]))
                final.push(tokens[++i])

            final.push(curr);
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