/* eslint-disable no-template-curly-in-string */

const { Context }       = include ("lib/core/Context");
const { SourceAdapter } = include ("lib/core/SourceAdapter");

var context = new Context ({ text: "a: 1", required: false });
var result  = { a: 1 };


var no_path = require ("path");
var no_url  = require ("url");
var child   = new Context (context, { text: "b: 2", required: false });



function urlWithCwd (path)
{
    return no_url.pathToFileURL (no_path.join (process.cwd (), path + "")).href;
}



class TestSource extends SourceAdapter
{
    async onLoad ()
    {
        return SourceAdapter.NOT_FOUND;
    }
}


class UndefSource extends SourceAdapter
{
    async onLoad ()
    {
    }
}


Context.registerComponent (TestSource);
Context.registerComponent (UndefSource);


test.func (new Context ({ source: "test", required: true }), "resolve")
    .throws (/Source not found/i);


test.func (new Context ({ url: "undef:///", required: true }), "resolve")
    .throws (/unable to parse the source.*undef/i);


test.func (new Context (
    {
        url: "context://user:pass@localhost",
        text: "a: 3",
        required: true
    }), "resolve")
    .returns ({ a: 3 })
    .expecting ("the auth info is parsed", (o, r, t) => t.object.url.$.username == "user");


test.func (context, "resolve")
    .should ("resolve text 'a: 1' to an object")
    .returns (result)
    .expecting ("Context.required to return the set value", () => context.required == false)
    .expecting ("Context.$ to return the options", () => context.$.required == false)
;


test.func (child, "resolve")
    .returns ({ b: 2 })
    .expecting ("Context.root to return the root context", () => child.root == context)
    .expecting ("Context.parent to return the parent context", () => child.parent == context)
;


test.func (new Context ({ text: 3, builder: "value" }), "resolve")
    .returns (3)
    .expecting ("Context.text cast a non-string value to a string", (o, r, t) => t.object.text == "3");


test.func (new Context ({ text: "${?unset}", required: false, builder: "value" }), "resolve") // eslint-disable-line no-template-curly-in-string
    .should ("return `undefined` the substitution cannot be resolved")
    .returns (undefined);


test.func (new Context ({ url: "/root/abc", required: true }), "resolve")
    .should ("throw if the source returns `undefined`")
    .throws (/Source .+root/i);


test.func (new Context ({ text: undefined, required: true }), "resolve")
    .should ("throw when the resolution is `undefined` but required")
    .throws (/unable to parse the text/i);


test.func (new Context ({ text: "a: test | invalid-transform" }), "resolve")
    .should ("throw when the transform is invalid")
    .throws ();


test.func (new Context ({ text: "a: 3", transforms: ["invalid-transform"] }), "resolve")
    .should ("throw when the transform is invalid")
    .throws ();


test.func (new Context ({ text: "a: 3", url: "invalid-source:///text" }), "resolve")
    .should ("throw when the source is invalid")
    .throws ();


test.func (new Context ({ text: "a: 3", builder: "invalid-builder" }), "resolve")
    .should ("throw when the builder is invalid")
    .throws ();


test.func (new Context ({ text: "a:" }), "resolve")
    .should ("throw if the config is invalid")
    .throws ();


test.func (new Context ({ text: "a: 3", transforms: ["eval { expr: \"this.a + 10\" }"] }), "resolve")
    .should ("apply the transforms")
    .returns (13);


test.func (new Context (
    {
        text:         "result: ${add} | invoke { params: { x: 4, y: 5 } }",
        query:        "result",
        scope:        { add: function (x, y) { return x + y; } }

    }), "resolve")
    .should ("be able to apply the invoke resolution")
    .returns (9);


test.func (Context.resolve, "Context.resolve")
    .should ("throw if the string is not parsable when the default is not provided")
    .given ("a:", {})
    .given ({ text: "a:" }, {})
    .throws ();


test.func (Context.resolve, "Context.resolve")
    .should ("not throw if the string is not parsable when the default is provided")
    .given ("a:", {}, {})
    .given ({ text: "a:" }, {}, {})
    .returns ({});


test.func (new Context (
    {
        text:       `require "${urlWithCwd ("tests/resources/configs/simple/test.conf")}"`,
        transforms: ["eval { expr: \"this.a + v\", v: ${b} }"],
        required:   true

    }), "resolve")
    .should ("returns 3")
    .returns (3);


test.func (new Context (
    {
        text:       `include "${urlWithCwd ("tests/resources/configs/simple/test.conf")}"`,
        transforms: ["eval { expr: \"this.a + v\", v: ${bb} }"],
        required:   true

    }), "resolve")
    .throws (/unable to resolve transform 'eval'/i);


test.func (new Context (
    {
        text:       `include "${urlWithCwd ("tests/resources/configs/simple/test.conf")}"`,
        transforms: ["${trans} { expr: \"this.a + v\", v: ${bb} }"],
        required:   true

    }), "resolve")
    .throws (/unable to resolve transform.*Token/i);


test.func (new Context (
    {
        text:       `a: 1`,
        transforms: ["eval { expr: \"undefined\" }"]

    }), "resolve")
    .should ("return `undefined` if a transform returns `undefined`")
    .returns ();


test.func (new Context (
    {
        text:         "add: ${add} | invoke { args: [4, 5] }",
        query:        "add",
        scope:        { add: function (x, y) { return x + y; } }

    }), "resolve")
    .should ("be able to apply the invoke transform with args")
    .returns (9);


test.func (new Context (
    {
        text:         "add: ${add} | invoke { args: [4] }",
        query:        "add",
        scope:        { add: function (x) { return x + 5; } }

    }), "resolve")
    .should ("be able to apply the invoke transform with args")
    .returns (9)
;


test.func (new Context (
    {
        text:         "num: ${n}",
        scope:        "n: 3"

    }), "resolve")
    .should ("be able to parse the init scope")
    .returns ({ num: 3 })
;


test.func (new Context (
    {
        text:         "a: 3",
        query:        "b"

    }), "resolve")
    .should ("return `undefined` if the query returns `undefined`")
    .returns (undefined)
;

