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
    "=",
    "?",
    ">",
    "<",    
];

const COMMENT_ONE_LINE = "#"
const COMMENT_OPEN_CLOSE = "#[ ]#".split(" ");
const COMMENT_START_MULT_LINE = COMMENT_OPEN_CLOSE[0]
const COMMENT_END_MULTI_LINE = COMMENT_OPEN_CLOSE[1]

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
    'if',

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
    comment: {
        one_line(char: string | undefined): boolean
        {
            if (char == undefined) return false;
            return char == COMMENT_ONE_LINE
        },
        // TODO: MAKE MULTI LINE COMMENTS
        multi_line_start(string: string | undefined): boolean
        {
            if (string == undefined) return false;
            return string == COMMENT_START_MULT_LINE
        },
        multi_line_end(string: string | undefined): boolean
        {
            if (string == undefined) return false;
            return string == COMMENT_END_MULTI_LINE
        },
    },
    whitespace(char: string | undefined): boolean
    {
        if (char == undefined) return false;
        return /[\w]/.test(char);
    },
    punctuation(char: string | undefined): boolean
    {
        if (char == undefined) return false;
        return PUNC.includes(char);
    },
    operator(char: string | undefined): boolean
    {
        if (char == undefined) return false;
        return OPERATORS.includes(char);
    },
    digit(char: string | undefined): boolean
    {
        if (char == undefined) return false;
        return /[0-9]/.test(char)
    },
    identifier: {
        start(char: string | undefined): boolean 
        {
            if (char == undefined) return false;
            return /[a-zA-Z]/.test(char);
        },
        tail(char: string | undefined): boolean
        {
            if (char == undefined) return false;
            return is.identifier.start(char) || is.digit(char) || "_$.".includes(char);
        }
    },
    keyword(word: string | undefined): boolean
    {
        if (word == undefined) return false;
        return KEYWORDS.includes(word);
    }
}

export default is;
