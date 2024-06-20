const ARGS_SPLIT_PATTERN  = /(%(?:\d+:)[a-z]|%[a-z])/;
const ARG_FORMAT_PATTERN  = /%((\d+):)?([a-z])/;
const no_util             = require ("util");
const no_path             = require ("path");
const no_url              = require ("url");
const no_fs               = require ("fs");
const no_os               = require ("os");
const { TestFunc }        = require ("./setup/core/TestFunc");
const { TestFeature }     = require ("./setup/core/TestFeature");

global._            = require ("../lib/utils");
global.CWD          = process.cwd ();
global.TESTS_DIR    = CWD + "/tests";
global.CONFIGS_DIR  = no_path.join (TESTS_DIR, "/resources/configs");

global.include    = function (path)
{
    return require (no_path.join (CWD, path));
};

try
{
    require ("./setup.local.js");
}
catch (e)
{
}


test.trackBranches = function (...args)
{
    var branches = args.join ("-");

    test.trackBranches.branches[branches] = true;

    if (!test.trackBranches.testMode)
    {
        no_fs.appendFileSync (no_path.join (no_os.tmpdir (), `BRANCHES${test.trackBranches.suffix}`), branches + "\n");
    }

};


test.trackBranches.branches = {};
test.trackBranches.testMode = false;
test.trackBranches.suffix   = ""; // branches file suffix


afterAll (() =>
{
    let keys = Object.keys (test.trackBranches.branches);

    if (keys.length)
    {
        console.log ("Branches:", keys);
    }
});


test.normalizePath = function (path) // fix the windows driver letter inconsistency
{
    var cwd = process.cwd ();

    return path.toLowerCase ().startsWith (cwd.toLowerCase ())
        ? cwd + path.slice (cwd.length)
        : path
    ;
};


test.formatString  = function (str, args)
{
    var parts       = str.split (ARGS_SPLIT_PATTERN);
    var sortedArgs  = [];
    var formatted   = "";
    var i           = 0;

    for (let p of parts)
    {
        var match = p.match (ARG_FORMAT_PATTERN);

        if (match)
        {
            var arg = match[2] !== undefined ? args[match[2]] : args[i];

            sortedArgs.push (arg);

            formatted += "%" + (match[3] == "j" && typeof arg == "function" ? "s" : match[3]);
            ++i;
        }
        else
        {
            formatted += p;
        }
    }

    return no_util.format.apply (no_util, [formatted].concat (sortedArgs));
};


test.startServer = function (root)
{
    var server;


    beforeAll ((done) =>
    {
        var http  = require ("http");

        async function handleRequest (req, res)
        {
            var url   = no_url.parse (req.url, true);
            var path  = root + no_path.join ("/", url.pathname);
            var error = url.query.error;

            if (error)
            {
                if (error == "destroy")
                {
                    res.destroy ();
                }
                else
                {
                    res.statusCode = error;
                    res.end (`Internal error. (code = ${encodeURIComponent (error)})`);
                }

                return;
            }

            try
            {
                var content = await _.readFile (path, { encoding: null });

                res.writeHead (200, { "Content-Type": "text/plain" });
                res.end (content, "utf-8");
            }
            catch (e)
            {
                res.statusCode = 404;

                res.end (`File '${url.format ()}' not found!`);
            }
        }


        server = http.createServer (function (req, res)
        {
            handleRequest (req, res).then ();
        });

        server.listen (() =>
        {
            process.env.PORT = server.address ().port;

            done ();
        });
    });


    afterAll (() =>
    {
        server.close ();
    });
};



expect.every = function (predicate)
{
    return {
        name: "every",
        asymmetricMatch: function (actual)
        {
            for (let a of actual)
            {
                expect (a).toEqual (predicate);
            }

            return true;
        }
    };
};


expect.toBeGreaterThan = function (v)
{
    return {
        name: "toBeGreaterThan",
        asymmetricMatch: actual => actual > v
    };
};


expect.toBeInstanceOf = function (v)
{
    return {
        name: "toBeInstanceOf",
        asymmetricMatch: function (actual)
        {
            if (v == Symbol)
            {
                return typeof actual == "symbol";
            }
            else
            if (typeof v == "function")
            {
                return actual instanceof v;
            }
            else
            {
                return actual.constructor.name == v;
            }
        }
    };
};



test.func = function func ()
{
    return new TestFunc (...arguments);
};


test.func.only = function only ()
{
    return test.func (...arguments).only;
};


test.feature = function feature ()
{
    return new TestFeature (...arguments);
};


test.feature.only = function only ()
{
    return test.feature (...arguments).only;
};


