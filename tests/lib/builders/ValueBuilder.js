const { Context } = include ("lib/core/Context");



test.func (new Context ({ url: "context:///", text: " ", builder: "value" }), "resolve")
    .should ("return an empty object if the text is empty")
    .returns (undefined)
;

