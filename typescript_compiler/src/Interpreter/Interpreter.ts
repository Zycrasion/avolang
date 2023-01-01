import { AvoTypes } from "../AvoGlobals.js";
import { INode } from "../Parser/NodeTypes.js";
import { EvaluateExpression } from "./ExpressionHandler.js";
import { AvoFunction, EvaluateFunctionCall } from "./FunctionCallHandler.js";
import StandardScope from "./StandardLibrary.js";
import { EvaluateValue } from "./ValueHandler.js";
import { AvoVariable, EvaluateIdentifier, EvaluateKeyword, EvaluateVariableDeclaration } from "./VariableHandler.js";

export interface AvoReturn
{
    type : AvoTypes,
    value : any
}

export interface Scope
{
    Functions : {[key : string] : AvoFunction},
    Variables : {[key : string] : AvoVariable},
}

export function EvaluateNode(node : INode, scope : Scope) : AvoReturn
{
    if (INode.isExpressionNode(node)) return EvaluateExpression(node, scope);
    if (INode.isFunctionCallNode(node)) return EvaluateFunctionCall(node, scope);
    if (INode.isIdentifierNode(node)) return EvaluateIdentifier(node, scope);
    if (INode.isKeywordNode(node)) return EvaluateKeyword(node, scope);
    if (INode.isValueNode(node)) return EvaluateValue(node, scope);
    if (INode.isVariableDeclarationNode(node)) return EvaluateVariableDeclaration(node, scope);
}

export function RunAvo(nodes : INode[])
{
    let scope = StandardScope;

    for (let node of nodes)
    {
        EvaluateNode(node, scope);
    }
}