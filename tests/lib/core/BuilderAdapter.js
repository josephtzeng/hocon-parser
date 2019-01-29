const { BuilderAdapter } = include ("lib/core/BuilderAdapter");

var opts    = { file: "test" };
var builder = new BuilderAdapter (opts);

test.func (builder, "build")
    .should ("return `undefined`")
    .returns (undefined)
    .expecting ("$ to return the options", () => expect (builder.$).toEqual ({}))

;
