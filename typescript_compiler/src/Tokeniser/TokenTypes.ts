import { AvoTypes } from "../AvoGlobals";

export interface IToken
{
    tokenName : string;
}

export function AssertType(tok : IToken, check : (tok : IToken) => boolean, crucial = false)
{
    if (!check(tok))
    {
        if (!crucial) return false
        throw new Error("FAILED ASSERTION");
    }
    return true;
}

export function AssertValue(tok : IToken, value : string | number | boolean, crucial = false)
{
    if (tok["value"] === value)
    {
        return true;
    }
    if (!crucial) return false;
    throw new Error(`Assertion Failed, Expected ${value} Recieved ${tok["value"]}`)
}

export function HasValue(v : IToken) : v is {tokenName : string, value : string}
{
    return v["value"] !== undefined;
}

// Scope Token
// eg. { let a  = "a"; }


export class ScopeToken implements IToken
{
    tokenName = "ScopeToken";
    tokens : IToken[];

    constructor(tokens : IToken[] = [])
    {
        this.tokens = tokens;
    }

    push(token : IToken)
    {
        return this.tokens.push(token);
    }

    pop()
    {
        return this.tokens.pop()
    }

}

export function isScopeToken(token : IToken) : token is ScopeToken
{
    return token.tokenName == "ScopeToken"
}

// Value Token
// eg. "hi" 'hi' true false 19 1.9
export class ValueToken implements IToken
{
    tokenName: "ValueToken";
    type: AvoTypes;
    value: string | number | boolean;

    constructor(type : AvoTypes , value : string | number | boolean)
    {
        this.tokenName = "ValueToken";
        this.type = type;
        this.value = value;
    }
    
    isChar() : this is {type : "Char", value : string}
    {
        return this.type == "Char";
    }

    isString() : this is {type : "String", value : string}
    {
        return this.type == "String";
    }

    isStringType() : this is {type : "String" | "Char" , value : string}
    {
        return this.isString() || this.isChar();
    }

    isBool() : this is {type : "Boolean", value : boolean}
    {
        return this.type == "Boolean";
    }

    isNumber() : this is {type : "Float" | "Int", value : number}
    {
        return  this.isFloat() || this.isInt();
    }

    isFloat() : this is {type : "Float", value : number}
    {
        return  this.type == "Float";
    }

    isInt() : this is {type : "Int", value : number}
    {
        return this.type == "Int";
    }

}

export function isValueToken(token : IToken) : token is ValueToken
{
    return token.tokenName == "ValueToken";
}

// Variable Declarations

export class VariableDeclarationToken implements IToken
{
    tokenName: "VariableDeclarationToken";
    name : string;
    type : AvoTypes;
    value : ValueToken;

    constructor(name : string, type : AvoTypes, value : ValueToken)
    {
        this.tokenName = "VariableDeclarationToken";
        this.name = name;
        this.value = value;
        if (this.type != this.value.type)
        {
            throw new Error(`Error Mismatch between types ${type} and ${value.type} with value of ${value.value.toString()}`);
        }
    }
}

export function isVariableDeclarationToken(token : IToken) : token is VariableDeclarationToken
{
    return token.tokenName == "VariableDeclarationToken";
}

// Identifier Tokens

export class IdentifierToken implements IToken
{
    tokenName: "IdentifierToken";
    value : string;

    constructor(value : string)
    {
        this.tokenName = "IdentifierToken"
        this.value = value;
    }
}

export class KeywordToken implements IToken
{
    tokenName: "KeywordToken";
    value : string;

    constructor(value : string)
    {
        this.value = value;
        this.tokenName = "KeywordToken";
    }
}

export function isIdentiferToken(tok : IToken) : tok is IdentifierToken
{
    return tok.tokenName == "IdentifierToken";
}

export function isKeywordToken(tok : IToken) : tok is KeywordToken
{
    return tok.tokenName == "KeywordToken";
}

export function isIdentifierDerativeToken(tok : IToken) : tok is IdentifierToken | KeywordToken
{
    return isIdentiferToken(tok) || isKeywordToken(tok)
}

// Function Call Tokens

export class FunctionCallToken implements IToken
{
    tokenName: "FunctionCallToken";
    name : string;
    params : IToken[];

    constructor(name : string, params : IToken[])
    {
        this.tokenName = "FunctionCallToken";
        this.name = name;
        this.params = params;
    }
}

export function isFunctionCallToken(tok : IToken) : tok is FunctionCallToken
{
    return tok.tokenName == "FunctionCallToken";
}

// Punctuation Tokens

export class PunctuationToken implements IToken
{
    tokenName: "PunctuationToken";
    value : string;

    constructor(value : string)
    {
        this.tokenName = "PunctuationToken";
        this.value = value;
    }
}

export function isPunctuationToken(tok : IToken) : tok is PunctuationToken
{
    return tok.tokenName == "PunctuationToken";
}

// Punctuation Tokens

export class OperatorToken implements IToken
{
    tokenName: "OperatorToken";
    value : string;

    constructor(value : string)
    {
        this.tokenName = "OperatorToken";
        this.value = value;
    }
}

export function isOperatorToken(tok : IToken) : tok is OperatorToken
{
    return tok.tokenName == "OperatorToken";
}