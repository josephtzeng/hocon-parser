const parse           = include ("lib/parser");

const { Context }     = include ("lib/core/Context");
const { Node }        = include ("lib/core/Node");
const { ObjectNode }  = include ("lib/nodes/ObjectNode");
const { ValueNode }   = include ("lib/nodes/ValueNode");
const { FieldNode }   = include ("lib/nodes/FieldNode");


var valNode;


class CustomObjectNode extends ObjectNode
{
    constructor (parent, context)
    {
        super (parent, context);

        CustomObjectNode.used = true;
    }
}


class CustomValueNode extends ValueNode
{
    constructor (parent, context)
    {
        super (parent, context);

        valNode = this;
    }

}

Node.registerNode (CustomObjectNode);
Node.registerNode (CustomValueNode);


test.func (parse, "Node.createNode")
    .should ("use custom class")
    .given ({ text: "a: 3" })
    .returns ({ a: 3 })
    .expecting ("the custom class is used", () => CustomObjectNode.used)
    .expecting ("Node.parent to return the parent node", () => valNode.parent instanceof FieldNode)
    .expecting ("Node.firstToken to return the first token", () => valNode.firstToken.value == "3")
    .expecting ("Node.context to return the context", async () => valNode.context instanceof Context)
;


test.func (Node.formatPath, "Node.formatPath")
    .should ("return passed path value if it is not an array")
    .given ("this.is.a.path")
    .returns ("this.is.a.path")
;

test.func (Node.assign, "Node.assign")
    .should ("accept a dot-separated path")
    .given ({}, "this.is.a", "path")
    .returns ({ this: { is: { a: "path" } } })
;

test.feature ("Node methods")
    .given (new CustomObjectNode ())
    .expecting ("Node.error to show a message without the token text when the token is not specified", (node) =>
    {
        try
        {
            node.error ("test error");
        }
        catch (e)
        {
            return !~e.message.indexOf ("Token");
        }
    });


test.feature ("Node methods")
    .given (new Node ())
    .expecting ("default Node.onAppend () to return `undefined`", (node) => node.onAppend (),  undefined)
    .expecting ("default Node.onResolve () to return `undefined`", (node) => node.onResolve (), undefined)
;


test.feature ("Node getters")
    .given (new Node (new Node ()))
    .expecting ("Node.context should try to get parent's context if it does have one", (node) => node.context, undefined);


function A () {}

A.prototype.k = "v";

test.func (Node.merge, "Node.merge")
    .should ("copy merge owned properties")
    .given ({}, new A)
    .returns ({})
;
