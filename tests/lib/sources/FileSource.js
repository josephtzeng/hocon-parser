const { Context } = include ("lib/core/Context");


test.func (new Context ({ url: "tests/resources/configs/simple/result.json", builder: "content" }), "resolve")
    .should ("return the text with a FileSource and a ContentBuilder")
    .returnsType ("string");

test.func (new Context ({ url: "tests/resources/configs/simple/result.json", encoding: null, builder: "content" }), "resolve")
    .should ("return the text with a FileSource and `null` encoding")
    .returnsType (Buffer);

