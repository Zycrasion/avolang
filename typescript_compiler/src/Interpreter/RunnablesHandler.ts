import { IfNode } from "../Parser/NodeTypes";
import { AvoReturn, EvaluateNode, RunAvo, Scope } from "./Interpreter.js";

export function EvaluateIfNode(node : IfNode, scope : Scope) : AvoReturn
{
    let conditional = EvaluateNode(node.conditional, scope);
    if (conditional.type !== "Bool") throw new Error("Expected Boolean Recieved ".concat(conditional.type));

    if (conditional.value)
    {
        EvaluateNode(node.scope, scope);
    } else if (node.else_scope !== undefined)
    {
        EvaluateNode(node.else_scope, scope)
    }

    return {
        type : "Void",
        value : null
    }
}