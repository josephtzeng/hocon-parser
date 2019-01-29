const { Context }       = include ("lib/core/Context");
const { HashTransform } = include ("lib/transforms/HashTransform");


async function apply (opts, resolution)
{
    return await (new HashTransform (new Context (), opts)).apply (resolution);
}


test.func (apply, "HashTransform.apply")
    .should ("hash %1:j to %2:j given the options %0:o")
    .given ({ algorithm: "md5" }, "test")
    .returns ("098f6bcd4621d373cade4e832627b4f6")

    .given ({ algorithm: "md5", digest: "base64" }, "test")
    .returns ("CY9rzUYh03PK3k6DJie09g==")

    .given ({ algorithm: "sha1" }, Buffer.from ("test"))
    .returns ("a94a8fe5ccb19ba61c4c0873d391e987982fbbd3")

    .given ({ algorithm: "sha1" }, { a: 1 })
    .returns ("9f89c740ceb46d7418c924a78ac57941d5e96520")
;
