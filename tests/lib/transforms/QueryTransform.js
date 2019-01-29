const { Context }         = include ("lib/core/Context");
const { QueryTransform }  = include ("lib/transforms/QueryTransform");


async function apply (opts, resolution)
{
    return await (new QueryTransform (new Context (), opts)).apply (resolution);
}


test.func (apply, "QueryTransform.apply")
    .should ("return %2:j when the object is %1:o and the options is %0:o")
    .given ({ path: "a.b" }, { a: { b: 3 } })
    .returns (3)
;
