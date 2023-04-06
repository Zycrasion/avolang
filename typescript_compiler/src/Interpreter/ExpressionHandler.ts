import { ConditionalTypes } from "../AvoGlobals.js";
import { ConditionalNode, ExpressionNode, UnaryOperatorNode } from "../Parser/NodeTypes.js";
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

export function UnaryOperator(node: UnaryOperatorNode, scope : Scope) : AvoReturn
{
    let op = node.operator;
    let result : AvoReturn;

    switch(op)
    {
        case "!":
        case "not":
            result = EvaluateNode(node.body, scope);
            if (result.type == "Bool")
            {
                result.value = !result.value;
                return result;
            } else 
            {
                throw Error(`Expected Boolean recieved ${result.type}`);
            }
            break;
        
        default:
            throw Error(`Expected recognised operator, recieved ${op}`);

    }
    throw Error(`Expected recognised operator, recieved ${op}`);
}

export function EvaluateConditional(node : ConditionalNode, scope : Scope) : AvoReturn
{
    let result : boolean = false;
    let rhs = EvaluateNode(node.rhs, scope);
    let lhs = EvaluateNode(node.lhs, scope);
    if (rhs.type !== lhs.type) {throw new Error(`MISMATCHED TYPES BETWEEN ${JSON.stringify(rhs)} AND ${JSON.stringify(lhs)}`)}
    
    let r = rhs.value;
    let l = lhs.value;
    
    switch (node.type)
    {
        case ConditionalTypes.EQ:
            result = r === l;
            break;
            
        case ConditionalTypes.GT:
            result = r > l;
            break;
        
        case ConditionalTypes.GT_EQ:
            result = r >= l;
            break;
        
        case ConditionalTypes.LT:
            result = r < l;
            break;
        
        case ConditionalTypes.LT_EQ:
            result = r <= l;
            break;
        
        case ConditionalTypes.NEQ:
            result = r !== l;
            break;
        
        default:
            throw new Error(`Unrecognised ConditionalType ${node.type}`)
    }
    return {
        type : "Bool",
        value : result
    }
}