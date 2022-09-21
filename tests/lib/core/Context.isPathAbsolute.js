process.$platform = "unix";

const { Context } = include ("lib/core/Context");


test.func (new Context ({ source: "test" }), "isPathAbsolute")
    .given ("/a/b/c")
    .returns (true);


test.func (new Context ({ source: "test" }), "isPathAbsolute")
    .given ("a/b/c")
    .returns (false);
