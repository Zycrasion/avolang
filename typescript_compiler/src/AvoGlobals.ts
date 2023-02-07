import { KeywordNode } from "./Parser/NodeTypes";

export type AvoTypes = "Boolean" | "Int" | "Float" | "String" | "Char" | "Void";
export function KeywordToAvotype(kw : String)
{
    let _ = kw.split("");
    let __ = _.shift(); if (__ == undefined) throw new Error("Expected Keyword to be a non-zero length");
    _.unshift(__.toUpperCase())
    return _.join("");
}