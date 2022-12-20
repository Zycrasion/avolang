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

    private P3_ParseExpression(slice : IToken[]) : IToken[]
    {
        let num1 = slice[0]
        let operator = slice[1];
        let expr2 = slice.slice(2);
        if (operator != undefined && isOperatorToken(operator))
        {
            return [operator, num1, ...this.P3_ParseExpression(expr2)]
        } else 
        {
            return [num1];
        }
    }

    private MainDispatch(tokens: IToken[])
    {
        let final = [];
        for (let i = 0; i < tokens.length; i = final.length)
        {
            let curr = tokens[i];
            
            if (isFunctionCallToken(curr))
                curr.params = this.MainDispatch(curr.params);

            if (i + 1 < tokens.length && isOperatorToken(tokens[i+1]))
            {
                final.push(...this.P3_ParseExpression(tokens.slice(i)));
            } else 
            {
                final.push(curr);
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