const { Context }       = include ("lib/core/Context");
const { TransformNode } = include ("lib/nodes/TransformNode");
const { ContentNode }   = include ("lib/nodes/ContentNode");


var no_url  = require ("url");
var context = new Context ();


test.func (Context, "parseComponentConfig")
    .should ("parse the builder config %j")

    .given ("transforms", "", context)
    .returnsType (ContentNode)

    .given ("builders", "config { opt: value }", context)
    .returnsType (TransformNode)

    .given ("transforms", { invalid: { opt: "value" } }, context)
    .returnsType (ContentNode);


test.func (new Context ({ url: no_url.pathToFileURL ("/test.conf"), source: { opt: "value" } }), "resolve")
    .should ("use the source defined by the URL")
    .returns (undefined);


test.func (new Context ({ source: { name: "undef", options: { opt: "value" } } }), "resolve")
    .should ("throw if the source is not registered")
    .throws (/invalid source.*undef/i);


test.func (new Context ({ source: { context: { path: "value" } } }), "resolve")
    .should ("use the defined source if it is registered")
    .returns (undefined);
