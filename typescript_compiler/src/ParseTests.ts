import { Token } from "./Tokeniser.js";

export let check = {
    op(tok : Token)
    {
        return tok.type == "operator";
    },
    number(tok : Token)
    {
        return tok.type == "float" || tok.type == "int";
    }
}