const PUNC = [
    ":",
    ";",
    ",",
    ".",
    "{",
    "}",
    "[",
    "]",
    "(",
    ")",
    "="
];


const OPERATORS = [
    "+",
    "-",
    "*",
    "/"
]

const KEYWORDS = [
    // descriptors
    'var',
    'func',

    // TYPES

    // Number
    'int',
    'float',

    // Binary
    'bool',
    'true',
    'false',

    // String related
    'char',
    'string',
]

const is = {
    whitespace(char : string | undefined) : boolean
    {
        if (char == undefined) return false;
        return /[\w]/.test(char);
    },
    punctuation(char : string | undefined) : boolean
    {
        if (char == undefined) return false;
        return PUNC.includes(char);
    },
    operator(char : string | undefined) : boolean
    {
        if (char == undefined) return false;
        return OPERATORS.includes(char);
    },
    digit(char : string | undefined) : boolean
    {
        if (char == undefined) return false;
        return /[0-9]/.test(char)
    },
    identifier : {
        start(char : string | undefined) : boolean 
        {
            if (char == undefined) return false;
            return /[a-zA-Z]/.test(char);
        },
        tail(char : string | undefined) : boolean
        {
            if (char == undefined) return false;
            return is.identifier.start(char) || is.digit(char) || "_$.".includes(char);
        }
    },
    keyword(word : string | undefined) : boolean
    {
        if (word == undefined) return false;
        return KEYWORDS.includes(word);
    }
}

export default is;
