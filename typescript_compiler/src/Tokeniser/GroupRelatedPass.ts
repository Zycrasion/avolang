import { TokeniserPass } from "./Pass.js";
import { FunctionCallToken, HasValue, IdentifierToken, isIdentiferToken, isPunctuationToken, IToken } from "./TokenTypes.js";

export class GroupRelatedPass implements TokeniserPass
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

    private ParseSeperated(begin : string, seperator: string, end: string)
    {
        let parsed : IToken[] = [];
        if (HasValue(this.current) && this.current.value == begin) this.Next();
        let ActiveToken : IToken;
        while  ((ActiveToken = this.Next()) !== undefined)
        {
            if (HasValue(ActiveToken))
            {
                if (ActiveToken.value == end) break;
                if (ActiveToken.value == seperator) continue;
            }

            parsed.push(this.ParseToken(ActiveToken));
        }
        return parsed;
    }

    private ScanFunctionCall(curr: IdentifierToken): FunctionCallToken
    {
        let name = curr.value;
        let params: IToken[] = this.ParseSeperated("(",",", ")");

        return new FunctionCallToken(name, params);
    }

    private ParseToken(curr: IToken)
    {
        let next = this.Peek()

        if (!isIdentiferToken(curr)) return curr;
        if (!(isPunctuationToken(next) && next.value == "(")) return curr;
        
        return this.ScanFunctionCall(curr);
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