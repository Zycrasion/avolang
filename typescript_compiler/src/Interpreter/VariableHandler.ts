import { AvoTypes, KeywordToAvotype } from "../AvoGlobals.js";
import { IdentifierNode, INode, KeywordNode, VariableDeclarationNode } from "../Parser/NodeTypes.js";
import { AvoReturn, EvaluateNode, Scope } from "./Interpreter.js";
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
    let type = KeywordToAvotype(node.type);
    let valueRaw = EvaluateNode(node.value, scope);
    let value = valueRaw.value;
    if (type !== valueRaw.type) throw new Error(`MISMATCHED TYPES ON VARIABLE DECLARATION: ${name}`)

    let variable = scope.Variables[name] = {
        type,
        value
    }

    return variable;
}