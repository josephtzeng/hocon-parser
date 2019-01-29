const { SourceAdapter } = include ("lib/core/SourceAdapter");

var source = new SourceAdapter ({ url: "context:///abc" });



test.func (source, "load")
    .should ("return `undefined`")
    .returns (undefined);

test.func (source, "load")
    .should ("return `undefined`")
    .returns (undefined);

test.func (source, "appendPath")
    .should ("return the original path by default")
    .given ("def")
    .returns ("def");
