import { HasValue, IToken } from "../Tokeniser/TokenTypes.js";

export interface TokenFilter
{
    callback : (token : IToken) => boolean;
    value : string;
}

export namespace TokenFilter
{
    export function build(callback : (token : IToken) => boolean, value : string) : TokenFilter
    {
        return {
            callback,
            value
        }
    }

    export function evaluate(self : TokenFilter, tok : IToken) : boolean
    {
        return HasValue(tok) && self.callback(tok) && tok.value == self.value;
    }
}