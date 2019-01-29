const { Context }           = include ("lib/core/Context");
const { ModulepathSource }  = include ("lib/sources/ModulepathSource");

const no_path = require ("path");
const context = new Context ({ url: "modulepath:///" + no_path.normalize ("tests/resources/configs/simple/result.json") });


async function loadSource (context)
{
    await context.initUrl ();
    await context.initSource ();
    await context.resolveSource ();
    await context.loadSource ();

    var source = context.source;

    if (!(source instanceof ModulepathSource))
    {
        throw new Error ("The source is not an instance of ModulepathSource.");
    }

    return source.data;
}



test.func (loadSource, "ModulepathSource.load ()")
    .should ("load result.json as text")
    .given (context)
    .returnsType ("string")

;
