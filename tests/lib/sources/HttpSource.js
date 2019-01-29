const { Context }     = include ("lib/core/Context");
const { HttpSource }  = include ("lib/sources/HttpSource");

const context         = new Context ({ url: "http://localhost:PORT/simple/result.json" });
const jsContext       = new Context ({ url: "http://localhost:PORT/simple/test.js" });
const nothingContext  = new Context ({ url: "http://localhost:PORT/include-params.default/sample.txt" });
const pngContext      = new Context ({ url: "http://localhost:PORT/simple/nodejs.png" });
const notFoundContext = new Context ({ url: "http://localhost:PORT/not-found.conf" });
const errorContext    = new Context ({ url: "http://localhost:PORT/not-found.conf?error=500" });


test.startServer (TESTS_DIR + "/resources/configs");


beforeAll (async () =>
{
    for (let c of [context, jsContext, nothingContext, pngContext, notFoundContext, errorContext])
    {
        c.$.url = c.$.url.replace ("PORT", process.env.PORT);
    }
});


async function loadSource (context)
{
    await context.initUrl ();
    await context.initSource ();
    await context.resolveSource ();
    await context.loadSource ();

    var source = context.source

    if (!(source instanceof HttpSource))
    {
        throw new Error ("The source is not an instance of HttpSource.");
    }

    return source.data;
}


test.func (loadSource, "HttpSource.load ()")
    .should ("load result.json as text")
    .given (context)
    .returnsType ("string")

    .should ("load test.js as text")
    .given (jsContext)
    .returnsType ("string")

    .should ("load nothing.txt as text")
    .given (nothingContext)
    .returnsType ("string")

    .should ("load nodejs.png as binary")
    .given (pngContext)
    .returnsType (Buffer)

    .should ("return `undefined` if the file is not found")
    .given (notFoundContext)
    .returns (undefined)

    .should ("throw if the server returns other error code")
    .given (errorContext)
    .throws (/internal/i)
;
