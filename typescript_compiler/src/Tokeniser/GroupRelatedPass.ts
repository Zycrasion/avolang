import { TokeniserPass } from "./Pass.js";
import { FunctionCallToken, IdentifierToken, isIdentiferToken, isPunctuationToken, IToken, PunctuationToken, ScopeToken } from "./TokenTypes.js";

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

        // Typescript wouldn't stop screaming at me
        this.current = {tokenName : "undefined"};
        this.Curr();
        
        this.pass = [];
    }

    private Curr()
    {
        let __temp__ = this.content.at(this.index);
        if (__temp__ == undefined)
        {
            throw new Error("Tried to access out-of-bounds")
        }
        return this.current = __temp__;
    }

    private Peek()
    {
        let __temp__ = this.content.at(this.index + 1);
        if (__temp__ == undefined)
        {
            throw new Error("Tried to access out-of-bounds")
        }
        return this.current = __temp__;
    }

    private Next()
    {
        let __temp__ = this.content.at(++ this.index);
        if (__temp__ == undefined)
        {
            throw new Error("Tried to access out-of-bounds")
        }
        return this.current = __temp__;
    }

    private ParseSeparated(begin : string, seperator: string, end: string)
    {
        let parsed : IToken[] = [];
        if (isPunctuationToken(this.current) && this.current.value == begin) this.Next();
        let ActiveToken : IToken;
        while  ((ActiveToken = this.Next()) !== undefined)
        {
            if (isPunctuationToken(ActiveToken))
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
            tokens.push(this.ParseToken(this.current));
        }
        return new ScopeToken(tokens);
    }

    private ParseToken(curr: IToken)
    {
        let next = this.Peek()

        if (isPunctuationToken(curr) && curr.value == "{") return this.ScanScopeCall(curr);

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
        let token = this.ParseToken(this.Curr());
        this.pass.push(token);
        while (this.index + 1 < this.content.length)
        {
            this.Next();
            let token = this.ParseToken(this.Curr());
            this.pass.push(token);
        }
        return this.pass;
    }
}