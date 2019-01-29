const { Context }       = include ("lib/core/Context");
const { EvalTransform } = include ("lib/transforms/EvalTransform");


async function apply (opts, resolution)
{
    return await (new EvalTransform (new Context (), opts)).apply (resolution);
}


test.func (apply, "EvalTransform.constructor")
    .should ("throw if the expression is not set")
    .given ({}, 3)
    .throws ()

    .should ("return the evaluated expression")
    .given ({ expr: "a + b", a: 3, b: 4 })
    .returns (7)

    .should ("should use the resolution param if set")
    .given ({ expr: "a + b + resolution", a: 3, b: 4, resolution: 9 }, 10)
    .returns (16)

    .should ("should add the resolution as param if not set")
    .given ({ expr: "a + b + resolution", a: 3, b: 4 }, 10)
    .returns (17)

    .should ("should evaluate the expression with the resolution as `this`")
    .given ({ expr: "a + b + this", a: 3, b: 4, resolution: 20 }, 10)
    .returns (17)
;
