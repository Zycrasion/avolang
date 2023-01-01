import { AvoTypes } from "../AvoGlobals";

export namespace INode
{
    export function isValueNode(node : INode) : node is ValueNode
    {
        return node.nodeName == "ValueNode";
    }

    export function isVariableDeclarationNode(node : INode) : node is VariableDeclarationNode
    {
        return node.nodeName == "VariableDeclaration"
    }

    export function isExpressionNode(node : INode) : node is ExpressionNode
    {
        return node.nodeName == "Expression";
    }

    export function isIdentifierNode(node : INode) : node is IdentifierNode
    {
        return node.nodeName == "Identifier";
    }

    export function isKeywordNode(node : INode) : node is KeywordNode
    {
        return node.nodeName == "Keyword";
    }

    export function isFunctionCallNode(node : INode) : node is FunctionCallNode
    {
        return node.nodeName == "FunctionCall";
    }
}

export interface INode
{
    nodeName : string;
}

export class ValueNode implements INode
{
    nodeName = "ValueNode";
    type : AvoTypes;
    value : string | number | boolean;

    constructor(type : AvoTypes, value : string | number | boolean)
    {
        this.type = type;
        this.value = value;
    }
}

export class VariableDeclarationNode implements INode
{
    nodeName = "VariableDeclaration";
    name : string;
    type : AvoTypes;
    value : ValueNode;

    constructor(type : AvoTypes, name : string, value : ValueNode)
    {
        this.type = type;
        this.name = name;
        this.value = value;
    }
}

export class ExpressionNode implements INode
{
    nodeName = "Expression";
    left : INode;
    right : INode;
    operator : string;

    constructor(left : INode, op : string, right : INode)
    {
        this.left = left;
        this.operator = op;
        this.right = right;
    }
}

export class IdentifierNode implements INode
{
    nodeName = "Identifier";
    id : string;

    constructor(id : string)
    {
        this.id = id;
    }
}

export class KeywordNode implements INode
{
    nodeName = "Keyword";
    kw : string;

    constructor(id : string)
    {
        this.kw = id;
    }
}


export class FunctionCallNode implements INode
{
    nodeName = "FunctionCall";
    name : string;
    params : INode[];

    constructor(name : string, params : INode[])
    {
        this.name = name;
        this.params = params;
    }
}