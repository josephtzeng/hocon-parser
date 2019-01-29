const { Context } = include ("lib/core/Context");

const context = new Context ({ url: "context://", text: "test", builder: "content" });


test.func (context, "resolve")
    .should ("return Context.text with the ContextSource and the ContentBuilder")
    .returns ("test")
;
