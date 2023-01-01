import { ValueNode } from "../Parser/NodeTypes.js";
import { AvoReturn, Scope } from "./Interpreter.js";

export function EvaluateValue(node : ValueNode, scope : Scope) : AvoReturn
{
    return {
        type : node.type,
        value : node.value
    }
}