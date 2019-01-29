const { Context }     = include ("lib/core/Context");
const { ContentNode } = include ("lib/nodes/ContentNode");



async function resolveScript (context)
{
    return await context.resolve ();
}



test.func (resolveScript, "Context.resolve () with ScriptBuilder")
    .should ("return the object from simple/test.js")
    .given (new Context ({ url: "tests/resources/configs/simple/test.js", builder: "script" }))
    .returnsType (Object)
    .expecting ("the object has a 'number' property", (out) => "number" in out)
    .expecting ("the context's node is an instance of ContentNode", (out, res, tf) => tf.args[0].node instanceof ContentNode)

    .given (new Context ({ text: "", builder: "script" }))
    .should ("return `undefined` if the source returns empty text")
    .returns (undefined)

    .should ("return `undefined` if the script exports nothing")
    .given (new Context ({ text: "a = 3", builder: "script" }))
    .returns (undefined)

    .should ("return `undefined` if there is a script error")
    .given (new Context ({ text: "a + b", builder: "script" }))
    .returns (undefined)

    .can ("run the script in a new context")
    .given (new Context ({ text: "exports.a = 3", builder: { name: "script", options: { vmContext: "new" } } }))
    .returns ({ a: 3 })
;


