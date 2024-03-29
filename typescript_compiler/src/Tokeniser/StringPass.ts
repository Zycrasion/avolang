import is from "../charTests.js";
import { IdentifierToken, IToken, KeywordToken, OperatorToken, PunctuationToken, ValueToken } from "./TokenTypes.js";
import { TokeniserPass } from "./Pass.js";
import { AvoTypes } from "../AvoGlobals.js";
export class StringPass implements TokeniserPass
{
    private index: number;
    private pass: IToken[];
    private current: string | undefined;
    private content: string[];
    private hasRun: boolean;

    get result()
    {
        if (!this.hasRun) this.Run();
        this.hasRun = true;
        return this.pass;
    }

    // Utilities

    constructor(content: string)
    {
        this.hasRun = false;
        this.content = content.split("");
        this.index = 0;
        this.current = "";
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

    private ReadUntil(endString: string, callback: (str: string) => boolean = (str: string) => false)
    {
        let entire = "";
        while (this.Next() != endString)
        {
            if (this.current != undefined && callback(this.current)) { break; }
            entire = entire.concat(this.current != undefined ? this.current : "");
        }
        return entire;
    }

    private ReadWhile(condition: (str: string | undefined) => boolean)
    {
        let entire = "";
        while (condition(this.Peek()))
        {
            this.Next();
            entire = entire.concat(this.current == undefined ? "" : this.current);
        }
        return entire;
    }

    private ParseNum(curr: string): ValueToken
    {
        let isFloat = false;
        let numStr = curr + this.ReadWhile(
            str =>
            {
                if (str == "." && isFloat == false)
                {
                    isFloat = true;
                }
                return is.digit(str) || str == "."
            }
        );

        let num = parseFloat(numStr);
        let type: AvoTypes = isFloat ? "Float" : "Int";

        return new ValueToken(
            type,
            num
        )
    }

    private ParseID(curr: string): IdentifierToken | KeywordToken
    {
        let id = curr + this.ReadWhile(is.identifier.tail);

        if (is.keyword(id))
        {
            return new KeywordToken(id);
        }
        return new IdentifierToken(id);
    }

    private ParseString(curr: string): ValueToken
    {
        let txt = this.ReadUntil(curr);
        return new ValueToken(
            curr == "'" ? "Char" : "String",
            txt
        )
    }

    private IgnoreCommment(curr : string) : null
    {
        this.ReadUntil("\n");
        return null;
    }

    private ParseAtom(curr: string): IToken | null
    {
        if (curr.length != 1) throw new Error("TOKEN SIZE MUST BE 1");

        if (is.comment.one_line(curr)) return this.IgnoreCommment(curr)

        if (is.digit(curr)) return this.ParseNum(curr);

        if (curr == '"' || curr == "'") return this.ParseString(curr);

        if (is.identifier.start(curr)) return this.ParseID(curr);

        if (is.punctuation(curr)) return new PunctuationToken(curr);

        if (is.operator(curr)) return new OperatorToken(curr);

        return null;
    }

    /**
     * Groups strings together into basic groups
     * @returns Tokens
     */
    Run(): IToken[]
    {
        this.pass = [];
        while (this.current != undefined)
        {
            let token = this.ParseAtom(this.current);
            if (token != null)
            {
                this.pass.push(token);
            }
            this.Next();
        }
        return this.pass;
    }
}