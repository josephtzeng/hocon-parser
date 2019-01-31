const { sortObject }        = require ("./utils");
const { Context }           = require ("./core/Context");
const { SourceAdapter }     = require ("./core/SourceAdapter");
const { BuilderAdapter }    = require ("./core/BuilderAdapter");
const { TransformAdapter }  = require ("./core/TransformAdapter");
const { Node }              = require ("./core/Node");

const no_path = require ("path");
const no_os   = require ("os");
const _       = require ("./utils");

var pluginRegistered = false;



async function parser (opts)
{
    pluginRegistered = pluginRegistered || await registerPlugins ();

    var context = new Context (opts);
    var result  = await context.resolve ();


    return result !== null
        && !(result instanceof Buffer)
        && typeof result == "object" ? sortObject (result) : result;
}



async function registerPlugins ()
{
    if (parser.$mode == "cli" && require.main.filename.startsWith (no_path.dirname (__dirname)))
    {
        let userConfig = await Context.resolve ({ url: no_path.join (parser.$homedir, "pushcorn.conf") }) || {};

        for (let p of _.toArray (_.query (userConfig, "hocon-parser.plugins")))
        {
            p = require (no_path.join (no_path.dirname (process.execPath), "../lib", "node_modules", p));

            Context.registerComponent (...Object.values (p));
        }
    }
    else
    {
        let pkg;

        try
        {
            pkg = parser.$require.main.require ("../package.json");
        }
        catch (e)
        {
        }


        for (let p of _.toArray (_.query (pkg, "hocon-parser.plugins")))
        {
            p = parser.$require.main.require (p);

            Context.registerComponent (...Object.values (p));
        }
    }

    return true;
}


parser.parse    = parser;


parser.getClass = function (name)
{
    var path = no_path.join (__dirname, name.replace (/\./g, "/"));

    return require (path)[no_path.basename (path).replace (/\.js$/, "")];
};


parser.Context            = Context;
parser.Node               = Node;
parser.SourceAdapter      = SourceAdapter;
parser.BuilderAdapter     = BuilderAdapter;
parser.TransformAdapter   = TransformAdapter;
parser.registerComponent  = Context.registerComponent;
parser.registerNode       = Node.registerNode;

module.exports = parser;


// Properties with $ prefix are used for testing.
parser.$mode    = "cli";
parser.$require = require;
parser.$homedir = no_os.homedir ();
