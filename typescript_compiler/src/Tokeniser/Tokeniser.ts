import is from "../charTests.js";
import { GroupRelatedPass } from "./GroupRelatedPass.js";
import { TokeniserPass } from "./Pass.js";
import { StringPass } from "./StringPass.js";
import { AssertType, AssertValue, FunctionCallToken, IdentifierToken, isFunctionCallToken, isIdentiferToken, isIdentifierDerativeToken, isOperatorToken, isPunctuationToken, isValueToken, IToken, KeywordToken, OperatorToken, PunctuationToken, ValueToken, ValueTypes } from "./TokenTypes.js";

export class Tokeniser
{
    private Pass1: TokeniserPass;
    private Pass2: GroupRelatedPass;
    p3_index: number;
    final: IToken[];

    constructor(content: string)
    {
        this.Pass1 = new StringPass(content);
        this.Pass2 = new GroupRelatedPass(this.Pass1.result);
        this.p3_index = 0;
    }

    // TODO: Remove these and replace them


    // TODO: Seperate Pass 2
    

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
        this.final = this.P3_Main(this.Pass2.result)
        return this.final;
    }

    Result()
    {
        return this.RunPass3();
    }
}