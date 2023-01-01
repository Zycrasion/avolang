import { AvoTypes } from "../AvoGlobals.js";
import { IdentifierNode, INode, KeywordNode, VariableDeclarationNode } from "../Parser/NodeTypes.js";
import { AvoReturn, Scope } from "./Interpreter.js";
import { EvaluateValue } from "./ValueHandler.js";

export interface AvoVariable
{
    type : AvoTypes,
    value : any
}

export function EvaluateIdentifier(node : IdentifierNode, scope : Scope) : AvoReturn
{
    // Find out if it exists as a variable
    let existsVariable = scope.Variables[node.id];
    if (existsVariable !== null)
    {
        return existsVariable;
    }

    throw new Error(`Identifier ${node.id} Does Not Exist`)
}

export function EvaluateKeyword(node : KeywordNode, scope : Scope) : AvoReturn
{
    throw new Error("Keywords not yet implemented")
}

export function EvaluateVariableDeclaration(node : VariableDeclarationNode, scope : Scope) : AvoReturn
{
    let name = node.name;
    let type = node.type;
    let value = EvaluateValue(node.value, scope);

    let variable = scope.Variables[name] = {
        type,
        value
    }

    return variable;
}