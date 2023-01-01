import { KeywordNode } from "./Parser/NodeTypes";

export type AvoTypes = "Boolean" | "Int" | "Float" | "String" | "Char" | "Void";
export function KeywordToAvotype(kw : String)
{
    let _ = kw.split("");
    _.unshift(_.shift().toUpperCase())
    return _.join("");
}