import { AvoTypes } from "../AvoGlobals.js";
import { ConditionalNode, IfNode, INode } from "../Parser/NodeTypes.js";
import { EvaluateConditional, EvaluateExpression } from "./ExpressionHandler.js";
import { AvoFunction, EvaluateFunctionCall } from "./FunctionCallHandler.js";
import { EvaluateIfNode } from "./RunnablesHandler.js";
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
    ParentScope? : Scope,
    Functions : {[key : string] : AvoFunction},
    Variables : {[key : string] : AvoVariable},
}

export function CreateScope(parent : Scope | undefined = undefined) : Scope
{
    return {
        ParentScope : parent,
        Functions : {},
        Variables : {}
    }
}

export function FindFunctionWithinScope(scope : Scope, FunctionName : string) : AvoFunction
{
    let func = scope.Functions[FunctionName];
    if (func == null && scope.ParentScope != null)
    {
        return FindFunctionWithinScope(scope.ParentScope, FunctionName);
    }
    return func;
}

export function FindVariableWithinScope(scope : Scope, VariableName : string) : AvoVariable
{
    let variable = scope.Variables[VariableName];
    if (variable == null && scope.ParentScope != null)
    {
        return FindVariableWithinScope(scope.ParentScope, VariableName);
    }
    return variable;
}

export function EvaluateNode(node : INode, scope : Scope) : AvoReturn
{
    if (INode.isExpressionNode(node)) return EvaluateExpression(node, scope);
    if (INode.isFunctionCallNode(node)) return EvaluateFunctionCall(node, scope);
    if (INode.isIdentifierNode(node)) return EvaluateIdentifier(node, scope);
    if (INode.isKeywordNode(node)) return EvaluateKeyword(node, scope);
    if (INode.isValueNode(node)) return EvaluateValue(node, scope);
    if (INode.isVariableDeclarationNode(node)) return EvaluateVariableDeclaration(node, scope);
    if (INode.isConditionalNode(node)) return EvaluateConditional(node, scope);
    if (INode.isIfNode(node)) return EvaluateIfNode(node, scope)
    if (INode.isScopeNode(node)) return RunAvo(node.tree, scope)
    throw new Error("Error: Token passed to Evaluate Node isn't recognised ".concat(JSON.stringify(node)))
}

export function RunAvo(nodes : INode[], parent : Scope | undefined = undefined) : AvoReturn
{
    let scope : Scope;
    if (parent != undefined)
    {
        scope = CreateScope(parent);
    } else 
    {
        scope = StandardScope;
    }
    
    for (let node of nodes)
    {
        EvaluateNode(node, scope);
    }
    
    return {
        type : "Void",
        value: null
    }
}