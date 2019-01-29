const { Context }               = include ("lib/core/Context");
const { TransformAdapter }      = include ("lib/core/TransformAdapter");
const { Base64EncodeTransform } = include ("lib/transforms/Base64EncodeTransform");


test.feature ("TransformAdapter")
    .given (new TransformAdapter (new Context ()))
    .expecting ("TransformAdapter.apply () to return undefined", async (t) => await t.apply (), undefined)
;

test.feature ("Base64EncodeTransform")
    .given (new Base64EncodeTransform (new Context ()))
    .expecting ("TransformAdapter.apply () base64 encode a string", async (t) => await t.apply ("test"), "dGVzdA==")
    .expecting ("TransformAdapter.apply () base64 encode a buffer", async (t) => await t.apply (Buffer.from ("test", "utf-8")), "dGVzdA==")
;
