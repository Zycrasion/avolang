import { TokeniserPass } from "./Pass.js";
import { FunctionCallToken, IdentifierToken, isIdentiferToken, isPunctuationToken, IToken } from "./TokenTypes.js";

export class GroupRelatedPass implements TokeniserPass
{
    private index: number;
    private pass: IToken[];
    private current : IToken;
    private content : IToken[];
    private hasRun : boolean;   

    get result()
    {
        if (!this.hasRun) this.Run();
        this.hasRun = true;
        return this.pass;
    }

    constructor(content : IToken[])
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

    private ScanFunctionCall(curr: IdentifierToken): FunctionCallToken
    {
        let name = curr.value;
        let params: IToken[] = [];
        this.Next();
        let next = this.Next();
        // REFACTOR
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
            params.push(this.ParseToken(next));
            next = this.Next();
        }
        return new FunctionCallToken(
            name,
            params
        )
    }

    private ParseToken(curr: IToken)
    {
        if (isIdentiferToken(curr))
        {
            let next = this.Peek()
            if (isPunctuationToken(next) && next.value == "(")
            {
                return this.ScanFunctionCall(curr);
            }
        }
        return curr;
    }

    /**
     * Groups Related Tokens Together into more complex tokens
     * @returns Tokens
     */
    Run()
    {
        this.pass = [];
        while (this.Curr() !== undefined)
        {
            let token = this.ParseToken(this.Curr());
            this.pass.push(token);
            this.Next();
        }
        return this.pass;
    }
}