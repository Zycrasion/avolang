import { AvoTypes } from "../AvoGlobals.js";
import { FunctionCallNode, INode } from "../Parser/NodeTypes.js";
import { AvoReturn, EvaluateNode, Scope } from "./Interpreter.js";

export interface AvoFunction
{
    Arguments : number,
    ReturnType : AvoTypes,
    Callback : (...a : any) => any
}

export function FunctionBuilder(callback : (...a : any[]) => any, param_len : number, return_type : AvoTypes) : AvoFunction
{
    return {
        Callback : callback,
        Arguments: param_len,
        ReturnType : return_type
    }
}

export function CallAvoFunction(scope : Scope, Func : AvoFunction, ...params : INode[]) : AvoReturn
{
    let type = Func.ReturnType;
    let parameterLength = Func.Arguments;
    if (parameterLength !== params.length) {throw new Error(`Function Argument Mismatch!`);}

    let paramsFiltered = params.map(v => EvaluateNode(v, scope).value) 

    let value = Func.Callback(...paramsFiltered);

    return {
        type,
        value
    }
}

export function EvaluateFunctionCall(node : FunctionCallNode, scope : Scope) : AvoReturn
{
    let referencedFunction = scope.Functions[node.name];
    if (referencedFunction === null || referencedFunction === undefined)
    {
        throw new Error(`Error! Function ${node.name} does not exist!`);
    }

    return CallAvoFunction(scope, referencedFunction, ...node.params);
}