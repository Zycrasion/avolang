import { ExpressionNode } from "../Parser/NodeTypes.js";
import { AvoReturn, EvaluateNode, Scope } from "./Interpreter.js";

export function EvaluateExpression(node: ExpressionNode, scope : Scope): AvoReturn
{
    let a = EvaluateNode(node.left, scope);
    let b = EvaluateNode(node.right, scope);

    let result = 0;
    let type = a.type == b.type ? a.type : null;

    if (type == null) throw new Error(`Type Mismatch ${a.type} and ${b.type}`)

    switch (node.operator)
    {
        case "+":
            result = a.value + b.value;
            break;

        case "-":
            result = a.value - b.value;
            break;

        case "/":
            result = a.value / b.value;
            break;

        case "*":
            result = a.value *  b.value;
            break;

        default:
            throw new Error(`Operator ${node.operator} unsupported!`)
    }

    return {
        type,
        value: result
    }
}