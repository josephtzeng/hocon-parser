const fs    = require ("fs");
const cli   = require ("commander");
const pkg   = require ("../package.json");
const parse = require ("./parser");
const _     = require ("./utils");



function addTransform (t, transforms)
{
    transforms.push (t);

    return transforms;
}


cli
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
    .parse (process.argv);


async function run ()
{
    if (!cli.url && !(cli.url = cli.args[0]))
    {
        try
        {
            var stdin = fs.fstatSync (0);

            if (stdin.isFIFO () || stdin.isFile ())
            {
                cli.text = await new Promise (function (resolve, reject)
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
        }
    }

    if (!cli.url && !cli.text)
    {
        cli.help ();
    }

    if (cli.transform.length)
    {
        cli.transforms = cli.transform;
    }

    var output = await parse (cli);

    if ((!(output instanceof Buffer) && typeof output == "object") || cli.json)
    {
        output = JSON.stringify (output, null, "  ") + "\n";
    }

    if (cli.output)
    {
        await _.writeFile (cli.output, output);

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
            console.log (o); // eslint-disable-line no-console
        }
    })
    .catch ((e) =>
    {
        process.exitCode = 1;
        console.error (cli.debug ? e : e.message); // eslint-disable-line no-console
    });

