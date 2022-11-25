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
    whitespace(char : string) : boolean
    {
        return /[\w]/.test(char);
    },
    punctuation(char : string) : boolean
    {
        return PUNC.includes(char);
    },
    operator(char : string) : boolean
    {
        return OPERATORS.includes(char);
    },
    digit(char : string) : boolean
    {
        return /[0-9]/.test(char)
    },
    identifier : {
        start(char : string) : boolean 
        {
            return /[a-zA-Z]/.test(char);
        },
        tail(char : string) : boolean
        {
            return is.identifier.start(char) || is.digit(char) || "_$.".includes(char);
        }
    },
    keyword(word : string) : boolean
    {
        return KEYWORDS.includes(word);
    }
}

export default is;
