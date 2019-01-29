const parser          = include ("lib/parser");
const { Node }        = include ("lib/core/Node");
const { ObjectNode }  = include ("lib/nodes/ObjectNode");
const { ValueNode }   = include ("lib/nodes/ValueNode");


test.func (parser.getClass)
    .should ("return the class in the classes folder")
    .given ("core.Node")
    .returns (() => Node)

    .should ("return the class in a subfolder of classes")
    .given ("nodes.ObjectNode")
    .returns (() => ObjectNode)

    .should ("return the class in a subfolder of classes")
    .given ("nodes/ValueNode")
    .returns (() => ValueNode)
;
