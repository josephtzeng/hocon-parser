const fs    = require ("fs");
const cli   = require ("commander").program;
const pkg   = require ("../package.json");
const parse = require ("./parser");
const _     = require ("./utils");



function addTransform (t, transforms)
{
    transforms.push (t);

    return transforms;
}


const opts = cli
    .usage ("<url>")
    .option ("-u, --url <url>",         "The file path or URL to be parsed.")
    .option ("-o, --output <file>",     "The output file name.")
    .option ("-t, --text <HOCON>",      "The text to be parsed.")
    .option ("-q, --query <path>",      "Print the value at the given path.")
    .option ("-c, --scope <HOCON>",     "The initial context scope.")
    .option ("-E, --no-env",            "Do not use environment variables.")
    .option ("-R, --no-required",       "Ignore when the file or URL is inaccessible.")
    .option ("-j, --json",              "Always print the query result in JSON format.")
    .option ("-s, --strict",            "Strict mode.")
    .option ("-S, --source <HOCON>",    "The source name or config.")
    .option ("-B, --builder <HOCON>",   "The builder name or config.")
    .option ("-T, --transform <HOCON>", "The transform name or config. Repeat the option to apply multiple transforms.", addTransform, [])
    .option ("-d, --debug",             "Show stack trace on error.")

    .version (pkg.version, "-v, --version")
    .parse (process.argv)
    .opts ();


async function run ()
{
    if (!opts.url && !(opts.url = cli.args[0]))
    {
        try
        {
            var stdin = fs.fstatSync (0);

            if (stdin.isFIFO () || stdin.isFile ())
            {
                opts.text = await new Promise (function (resolve, reject)
                {
                    var data = "";

                    process.stdin.setEncoding ("UTF-8");

                    process.stdin
                        .on ("readable", function ()
                        {
                            var chunk;

                            while ((chunk = process.stdin.read ()))
                            {
                                data += chunk;
                            }
                        })
                        .on ("error", function (e)
                        {
                            reject (e);
                        })
                        .on ("end", function ()
                        {
                            resolve (data);
                        });
                });
            }
        }
        catch (e)
        {
            console.log (e);
        }
    }

    if (!opts.url && !opts.text)
    {
        cli.help ();
    }

    if (opts.transform.length)
    {
        opts.transforms = opts.transform;
    }

    var output = await parse (opts);

    if ((!(output instanceof Buffer) && typeof output == "object") || opts.json)
    {
        output = JSON.stringify (output, null, "  ") + "\n";
    }

    if (opts.output)
    {
        await _.writeFile (opts.output, output);

        return;
    }

    return output;
}


run ()
    .then (o =>
    {
        if (o instanceof Buffer || typeof o == "string")
        {
            process.stdout.write (o);
        }
        else
        if (o !== undefined)
        {
            console.log (o);
        }
    })
    .catch ((e) =>
    {
        process.exitCode = 1;
        console.error (opts.debug ? e : e.message);
    });

