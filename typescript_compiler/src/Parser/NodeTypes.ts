import { AvoTypes, ConditionalTypes } from "../AvoGlobals";

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

    export function isScopeNode(node : INode) : node is ScopeNode
    {
        return node.nodeName == "ScopeNode";
    }

    export function isIfNode(node : INode) : node is IfNode
    {
        return node.nodeName == "IfNode";
    }

    export function isConditionalNode(node : INode) : node is ConditionalNode
    {
        return node.nodeName == "ConditionalNode";
    }

    export function isUnaryOperatorNode(node: INode) : node is UnaryOperatorNode
    {
        return node.nodeName == "UnaryOperatorNode";
    }

    /**
    * PLACEHOLDER FOR BETA BUILDS
    */
    export function isXNode<Type extends INode>(node : INode, nodeName : string) : node is Type
    {
        console.log(`IsXNode Used for ${nodeName}.`);
        return node.nodeName == nodeName;
    }
}

export interface INode
{
    nodeName : string;
}

export class IfNode implements INode
{
    nodeName = "IfNode";
    conditional : INode;
    scope : ScopeNode;
    else_scope : ScopeNode | undefined;

    constructor(conditional : INode, scope : ScopeNode)
    {
        this.conditional = conditional;
        this.scope = scope;
    }

}

export class ConditionalNode implements INode
{
    nodeName = "ConditionalNode";
    type : ConditionalTypes;
    lhs : INode;
    rhs : INode;

    constructor(type : ConditionalTypes, rhs : INode, lhs : INode)
    {
        this.type = type;
        this.lhs = lhs;
        this.rhs = rhs;
    }
}


export class ScopeNode implements INode
{
    nodeName = "ScopeNode";
    tree : INode[];

    constructor(tree : INode[] = [])
    {
        this.tree = tree;
    }

    push(...items : INode[])
    {
        return this.tree.push(...items);
    }

    pop() : INode | undefined
    {
        return this.tree.pop()
    }

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
    value : INode;

    constructor(type : AvoTypes, name : string, value : INode)
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

export class UnaryOperatorNode implements INode
{
    nodeName = "UnaryOperatorNode";
    operator : string;
    body : INode;

    constructor(operator : string, body : INode)
    {
        this.operator = operator;
        this.body = body;
    }
}