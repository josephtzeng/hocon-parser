const { Context }       = include ("lib/core/Context");
const { ObjectNode }    = include ("lib/nodes/ObjectNode");
const { ConfigBuilder } = include ("lib/builders/ConfigBuilder");



test.func (new Context ({ url: "tests/resources/configs/simple/test.conf" }), "resolve")
    .should ("resolve simple/test.conf")
    .returnsType (Object)
    .expecting ("the root node to be an instance of ObjectNode", (o, r, $) => $.object.node instanceof ObjectNode)
;


test.func (new ConfigBuilder (new Context ()), "expandUrl")
    .should ("return the names with supported extensions if the file has no extension")
    .given (new Context.Url ("test"), [".conf", ".json", ".properties"])
    .returns (["test.conf", "test.json", "test.properties"])

    .should ("return an empty array if the file has an extension")
    .given (new Context.Url ("test.txt"), [".conf", ".json", ".properties"])
    .returns ([])
;
