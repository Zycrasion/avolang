import is from "../charTests.js";
import { IdentifierToken, IToken, KeywordToken, OperatorToken, PunctuationToken, ValueToken, ValueTypes } from "./TokenTypes.js";
import { TokeniserPass } from "./Pass.js";

export class StringPass implements TokeniserPass
{
    private index: number;
    private pass: IToken[];
    private current : string;
    private content : string[];
    private hasRun : boolean;

    get result()
    {
        if (!this.hasRun) this.Run();
        this.hasRun = true;
        return this.pass;
    }

    // Utilities

    constructor(content : string)
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

    // TODO
    private ReadUntil(endString : string, callback : () => boolean = () => false)
    {
        let entire = "";
        while (this.Next() != endString)
        {
            if (callback()) {break;}
            entire = entire.concat(this.current);
        }
        return entire;
    }

    // TODO
    private ReadWhile(str : string)
    {

    }

    private ParseNum(curr: string): ValueToken
    {
        let numStr = curr;
        let isFloat = false;
        let next = this.Peek();
        // REFACTOR
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

            this.Next();
            next = this.Peek();
        }

        let num = parseFloat(numStr);
        let type: ValueTypes = isFloat ? "Float" : "Int";

        return new ValueToken(
            type,
            num
        )
    }

    private ParseID(curr: string): IdentifierToken | KeywordToken
    {
        let id = curr;
        let next = this.Next();
        // REFACTOR
        while (is.identifier.tail(next))
        {
            id = id.concat(next);
            next = this.Peek();
            this.Next();
        }
        this.index--;

        if (is.keyword(id))
        {
            return new KeywordToken(id);
        }
        return new IdentifierToken(id);
    }

    private ParseString(curr : string) : ValueToken
    {
        let txt = this.ReadUntil(curr);
        return new ValueToken(
            curr == "'" ? "Char" : "String",
            txt
        )
    }

    private ParseAtom(curr: string): IToken
    {
        // REFACTOR
        if (curr.length != 1)
        {
            throw new Error("TOKEN SIZE MUST BE 1");
        }

        if (is.digit(curr))
        {
            return this.ParseNum(curr);
        }

        if (curr == '"' || curr == "'")
        {
            return this.ParseString(curr);
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
            return this.ParseID(curr);
        }
        return null;
    }

    /**
     * Groups strings together into basic groups
     * @returns Tokens
     */
    Run(): IToken[]
    {
        // REFACTOR
        this.pass = [];
        while (this.current !== undefined)
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