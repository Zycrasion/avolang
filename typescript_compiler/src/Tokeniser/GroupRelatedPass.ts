import { TokeniserPass } from "./Pass.js";
import { FunctionCallToken, HasValue, IdentifierToken, isIdentiferToken, isPunctuationToken, IToken, PunctuationToken, ScopeToken } from "./TokenTypes.js";

export class GroupRelatedPass implements TokeniserPass
{
    private index: number;
    private pass: IToken[];
    private current: IToken | undefined;
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

    private ParseSeparated(begin : string, seperator: string, end: string)
    {
        let parsed : IToken[] = [];
        if (this.current != undefined && HasValue(this.current) && this.current.value == begin) this.Next();
        let ActiveToken : IToken | undefined;
        while  ((ActiveToken = this.Next()) !== undefined)
        {
            if (HasValue(ActiveToken))
            {
                if (ActiveToken.value == end) break;
            }

            parsed.push(this.ParseToken(ActiveToken));
        }
        return parsed;
    }

    private ScanFunctionCall(curr: IdentifierToken): FunctionCallToken
    {
        let name = curr.value;
        let params: IToken[] = this.ParseSeparated("(",",", ")");

        return new FunctionCallToken(name, params);
    }

    private ScanScopeCall(curr: PunctuationToken): ScopeToken
    {
        let tokens : IToken[] = [];
        let currentToken = this.Peek();
        while (currentToken = this.Peek())
        {
            this.Next();
            if (isPunctuationToken(currentToken) && currentToken.value == "}") break;
            if (this.current == undefined) throw new Error("Expected Token");
            tokens.push(this.ParseToken(this.current));
        }
        return new ScopeToken(tokens);
    }

    private ParseToken(curr: IToken)
    {
        let next = this.Peek()

        if (isPunctuationToken(curr) && curr.value == "{") return this.ScanScopeCall(curr);

        if (!isIdentiferToken(curr)) return curr;

        if (next == undefined) throw new Error("Expected Token")
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
        while (this.current != undefined)
        {
            let curr = this.Curr();
            if (curr == undefined) {break;}

            let token = this.ParseToken(curr);
            this.pass.push(token);
            this.Next();
        }
        return this.pass;
    }
}