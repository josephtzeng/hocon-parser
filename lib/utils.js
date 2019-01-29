const no_fs   = require ("fs");
const no_path = require ("path");
const assert  = require ("assert");
const no_util = require ("util");

const INSPECT_OPTIONS = { depth: 10, colors: true, sorted: true };
const NODE_MODULE_DIR = no_path.sep + "node_modules";



function uuid ()
{
    var a, b;

    // https://gist.github.com/LeverOne/1308368
    for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):""); // eslint-disable-line curly

    return b;
}


function deCamelCase (str)
{
    return str.replace (deCamelCase.PATTERN, function ($0, index) { return (index ? "-" : "") + $0.toLowerCase (); });
}

deCamelCase.PATTERN    = /[A-Z]/g;


function readDirSync (path, type)
{
    const T   = readDir.TYPE;
    var files = [];
    var stat;

    assert (typeof path == "string", "'path' must be a string.");
    assert (arguments.length == 1 || type == T.ALL || type == T.FILE || type == T.DIR,
        `Invalid type: ${type && type.toString ()}`);

    assert (no_fs.existsSync (path) && (stat = no_fs.statSync (path)) && stat.isDirectory (),
        `'${path}' does not exisit or is not a directory.`)

    type = type || T.ALL;

    for (var f of no_fs.readdirSync (path, { withFileTypes: true }))
    {
        if (type == T.ALL
            || (type == T.FILE && f.isFile ())
            || (type == T.DIR && f.isDirectory ()))
        {
            files.push (f.name);
        }
    }

    return files;
}


readDirSync.TYPE  = toEnum ("ALL", "FILE", "DIR");


function readDir (path, type)
{
    return new Promise (function (resolve, reject)
    {
        try
        {
            resolve (readDirSync (path, type));
        }
        catch (e)
        {
            reject (e);
        }
    });
}


readDir.TYPE = readDirSync.TYPE;


function callStack ()
{
    var prepareStackTrace  = Error.prepareStackTrace;

    Error.prepareStackTrace = function (err, stack)
    {
        return stack;
    };

    var capture = {};

    Error.captureStackTrace (capture, callStack);

    var stack = capture.stack;

    Error.prepareStackTrace = prepareStackTrace;

    return stack;
}


function callerFile (position)
{
    if (!isNumber (position) || position < 0)
    {
        position = 0;
    }

    var stack = callStack ();
    var files = [];

    for (let s of stack)
    {
        files.push (s.getFileName ());
    }

    files.shift ();

    var first = files.shift ();

    while (first == files[0])
    {
        files.shift ();
    }

    assert (position < files.length, `Invalid position '${position}'.`);

    return files[position];
}


async function findFile (file)
{
    return new Promise (function (resolve, reject)
    {
        try
        {
            resolve (findFileSync (file));
        }
        catch (e)
        {
            reject (e);
        }
    });
}


function findFileSync (file)
{
    assert.equal (typeof file, "string", "file should be a string.");

    var files = {};
    var paths = [process.cwd ()].concat (module.paths);

    for (let p of paths)
    {
        p = no_path.join (p.replace (NODE_MODULE_DIR, ""), file);

        files[p] = true;
    }

    files[file] = true;

    for (let f in files)
    {
        let stat;

        if (no_fs.existsSync (f)
            && (stat = no_fs.statSync (f))
            && stat.isFile ())
        {
            return f;
        }
    }
}


async function readFile (path, opts)
{
    return new Promise (function (resolve, reject)
    {
        try
        {
            resolve (readFileSync (path, opts));
        }
        catch (e)
        {
            reject (e);
        }
    });
}


async function writeFile (path, content, opts)
{
    return new Promise (function (resolve, reject)
    {
        try
        {
            resolve (writeFileSync (path, content, opts));
        }
        catch (e)
        {
            reject (e);
        }
    });
}



function writeFileSync (path, content, opts)
{
    return no_fs.writeFileSync (path, content, options ({ encoding: "UTF-8" }, opts));
}


function readFileSync (path, opts)
{
    return no_fs.readFileSync (path, options ({ encoding: "UTF-8" }, opts));
}


function isType (obj, type)
{
    assert (typeof type == "string", "'type' should be a string.");

    if (obj === null || obj === undefined)
    {
        return false;
    }

    var t   = Object.prototype.toString.call (obj);

    t       = t.split (" ")[1];
    t       = t.substr (0, t.length - 1).toLowerCase ();

    return t == type.toLowerCase ();
}


function isNumber (v)
{
    return v !== null
        && v !== ""
        && !isNaN (Number ((v + "").trim () || undefined));
}


function isSymbol (v)
{
    return isType (v, "symbol");
}


function isArray (v)
{
    return isType (v, "array");
}


function isArrayish (v)
{
    return isArray (v) || isType (v, "Arguments") || (isObject (v) && "length" in v);
}


function isObject (v)
{
    return v !== null && isType (v, "object");
}


function toArray (args, flatten)
{
    if (args === null || args === undefined)
    {
        return [];
    }
    else
    if (isArrayish (args))
    {
        args    = Array.prototype.slice.call (args);

        if (flatten)
        {
            var res = [];

            while (args.length)
            {
                var arg = args.shift ();

                if (isArray (arg))
                {
                    args.unshift.apply (args, arg);
                }
                else
                {
                    res.push (arg);
                }
            }

            return res;
        }
        else
        {
            return args;
        }
    }
    else
    {
        return [args];
    }
}


function toEnum ()
{
    var e = {};

    for (let k of toArray (arguments, true))
    {
        var s = Symbol (k);

        e[k] = s;
    }

    return Object.freeze (e);
}



function clone (obj)
{
    if (obj && typeof obj == "object")
    {
        if (isArray (obj))
        {
            return obj
                .map (clone)
                .filter ((v) => v !== undefined && !isSymbol (v));
        }
        else
        {
            return Object.keys (obj)
                    .map ((k) => obj[k] !== undefined && !isSymbol (obj[k]) && { k: k, v: clone (obj[k]) })
                    .reduce ((a, o) => ((o && (a[o.k] = o.v), a)), {});
        }
    }
    else
    {
        return obj;
    }
}


function options (defaults, ...opts)
{
    defaults = defaults || {};

    assert (isObject (defaults), "'defaults' must be an object.");

    var keys  = Object.keys (defaults);
    var copy  = clone (defaults);

    for (let k of keys)
    {
        for (let o of opts)
        {
            if (isObject (o) && k in o && o[k] !== undefined)
            {
                copy[k] = o[k];
            }
        }
    }

    return copy;
}


function parseData (data, strict)
{
    if (typeof data == "string")
    {
        var d = data.trim ();

        if (d == "true")
        {
            return true;
        }

        if (d == "false")
        {
            return false;
        }

        if (d == "null")
        {
            return null;
        }

        if (!(strict && (d[0] == "." || d.length != 1 && d[0] == "0")) && isNumber (d) && !d.endsWith ("Infinity"))
        {
            return +d;
        }
    }

    return data;
}


function compileExprForArray (array, expr, aliases)
{
    var body  = "try { return " + expr + "; } catch (e) {};";
    var props = Object.keys (array.reduce ((a, v) => Object.assign (a, isObject (v) || typeof v == "function" ? v : null), {}))

    try
    {
        let func = Function.apply (null, (aliases || []).concat (props, body));

        func.props  = props;
        func.body   = body;
        func.toArgs = (el, ...args) => [el].concat (args).concat (props.map ((p) => el[p]));

        return func;
    }
    catch (e)
    {
        throw new Error (`Invalid expression: '${expr}'.`);
    }
}




function arrayReduce (array, expr, initValue)
{
    array = toArray (array);

    if (!array.length)
    {
        return array;
    }

    var func  = compileExprForArray (array, expr, ["$", "$accumulator", "$index", "$array"]);
    var cb    = function (a, e, i)
    {
        var ctx   = { element: e, accumulator: a, index: i, array: array };
        var args  = func.toArgs (e, a, i, array);

        return func.apply (ctx, args);

    };

    var args = [cb];

    if (arguments.length === 3)
    {
        args.push (initValue);
    }

    return array.reduce.apply (array, args);
}



function arrayMap (array, expr)
{
    array = toArray (array);

    if (!array.length)
    {
        return array;
    }

    var func = compileExprForArray (array, expr, ["$", "$index", "$array"]);

    return array.map (function (e, i)
    {
        var ctx   = { element: e, index: i, array: array };
        var args  = func.toArgs (e, i, array);

        return {
            result: func.apply (ctx, args),
            ...ctx
        };
    });
}


function indexOf (array, o)
{
    for (let [i, a] of array.entries ())
    {
        if (isEqual (a, o))
        {
            return i;
        }
    }

    return -1;
}


function isEqual (a, b)
{
    var same = false;

    if (a !== null
        && b !== null
        && typeof a == "object"
        && typeof b == "object")
    {
        var ka  = Object.keys (a);
        var kb  = Object.keys (b);

        same    = ka.length == kb.length;

        if (same)
        {
            for (let k of ka)
            {
                if (!isEqual (a[k], b[k]))
                {
                    same = false;
                    break;
                }
            }
        }
    }
    else
    {
        same = a === b;
    }

    return same;
}


function arrayStartsWith (a, b)
{
    assert (isArray (a) && isArray (b), "Both parameters must be an array.");

    if (a.length >= b.length)
    {
        for (let [i, e] of b.entries ())
        {
            if (a[i] !== e)
            {
                return false;
            }
        }

        return true;
    }

    return false;
}


function sortObject (obj)
{
    var isObj = isObject (obj);

    assert (isObj || isArray (obj), "The first parameter must be an object or array.");

    var keys    = Object.keys (obj);
    var newObj  = isObj ? {} : obj;

    if (isObj)
    {
        keys.sort ();
    }

    for (let key of keys)
    {
        var v = obj[key];

        newObj[key] = (isObject (v) || isArray (v)) ? sortObject (v) : v;
    }

    return newObj;
}


function debug (tag, ...args)
{
    var handler = debug.getHandler (tag, args[0]);

    if (handler)
    {
        for (let [i, a] of args.entries ())
        {
            if (typeof a == "object")
            {
                args[i] = no_util.inspect (a, INSPECT_OPTIONS).replace (/\n/g, "\n    ");
            }
        }

        handler (...args);
    }

    return args;
}


debug.HANDLERS    = {};
debug.TAG_MAP     = {};
debug.module      = null;


debug.getHandler  = function (tag, message)
{
    if (debug.module === null || process.env.DEBUG_MODULE !== debug.lastModule)
    {
        try
        {
            debug.module = require (debug.lastModule = "DEBUG_MODULE" in process.env ? process.env.DEBUG_MODULE : "debug");
        }
        catch (e)
        {
            debug.module = false;
        }
    }

    if (debug.module === false)
    {
        return;
    }

    var key = typeof tag == "object" ? tag.constructor.name : tag;

    key += ":" + message;

    var mapped = debug.TAG_MAP[key];

    if (!mapped)
    {
        var stack = callStack ()[2];
        var type  = stack.getTypeName ();
        var func  = stack.getFunctionName ();

        mapped = debug.TAG_MAP[key] = `${type}:${func} [${stack.getLineNumber ()}:${stack.getColumnNumber ()}]`;
    }

    return (debug.HANDLERS[mapped] = debug.HANDLERS[mapped] || debug.module (mapped));
};


function symbolString (s)
{
    return s.toString ()
        .slice (7, -1)
        .toLowerCase ();
}


function defaultOption (clazz)
{
    var c = clazz;

    while (c)
    {
        if (c.defaults)
        {
            return Object.keys (c.defaults)[0];
        }

        c = Object.getPrototypeOf (c);
    }
}



function query (obj, path)
{
    if (obj === null || obj === undefined)
    {
        return;
    }

    var paths = isArray (path) ? path.slice () : query.parsePath (path);


    while ((path = paths.shift ()) !== undefined)
    {
        let spread = false;

        if (obj[path] !== undefined)
        {
            obj = obj[path];
        }
        else
        if (path[0] == query.FILTER_OPEN || (spread = (path[0] == "*" && path[1] == query.FILTER_OPEN)))
        {
            if (isArray (obj))
            {
                obj = obj.reduce ((a, v) => ((v = query (v, path), a.concat (v === undefined ? [] : v))), []);
            }
            else
            {
                let result = arrayMap ([obj], path.slice (spread ? 2 : 1, -1))[0].result;

                return result ? (spread ? result : obj) : undefined;
            }
        }
        else
        {
            return;
        }
    }

    return obj;
}


query.parsePath = function (path)
{
    var paths   = [];
    var k       = "";
    var opens   = 0;

    for (let c of [...path])
    {
        if (!opens && c == ".")
        {
            k = k.trim ();

            if (k.length)
            {
                paths.push (k);
            }

            k = "";
        }
        else
        {
            if (c == query.FILTER_OPEN)
            {
                ++opens;
            }
            else
            if (c == query.FILTER_CLOSE)
            {
                --opens;

                if (opens < 0)
                {
                    throw new Error (`Extra close filter character in the path expression '${path}'.`);
                }
            }

            k += c;
        }
    }

    if (opens)
    {
        throw new Error (`Filter not closed in the path expression '${path}'.`);
    }

    k = k.trim ();

    if (k.length)
    {
        paths.push (k);
    }

    return paths;
};


query.FILTER_OPEN     = "{";
query.FILTER_CLOSE    = "}";


// https://github.com/goatslacker/get-parameter-names/blob/master/index.js
function paramNames (func)
{
    return func.toString()
            .replace (paramNames.COMMENTS, "")
            .replace (paramNames.DEFAULT_PARAMS, "")
            .split (/\s*(\)|\}|=>)\s*/, 1)[0]
            .split (/\s*,\s*/)
            .map ((s) => s.replace (/^.*\(/, "").trim ());
}

paramNames.COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
paramNames.DEFAULT_PARAMS = /[=][^,]+/mg;


function invokeWithParams (func, params)
{
    var names = paramNames (func);
    var args  = [];

    for (let name of names)
    {
        args.push (params[name]);
    }

    return func.apply (this == global ? {} : this, args);
}


function propertyNames (obj)
{
    var names       = [];
    var nameIndex   = {};

    for (var o = obj; o && o != Object.prototype; o = Object.getPrototypeOf (o))
    {
        var ns = Object.getOwnPropertyNames (o);

        for (var i = 0; i < ns.length; ++i)
        {
            var n = ns[i];

            if (!propertyNames.IGNORED_PROPERTIES.test (n) && !nameIndex[n])
            {
                nameIndex[n] = true;

                names.push (n);
            }
        }
    }

    return names;
}


propertyNames.IGNORED_PROPERTIES = /^(root|global|constructor)$/i;



module.exports =
{
    callStack,
    callerFile,
    findFileSync,
    readFileSync,
    writeFileSync,
    writeFile,
    findFile,
    readFile,
    readDirSync,
    readDir,
    isType,
    isObject,
    isEqual,
    isNumber,
    isArray,
    isArrayish,
    toArray,
    toEnum,
    options,
    parseData,
    sortObject,
    debug,
    clone,
    arrayStartsWith,
    uuid,
    symbolString,
    deCamelCase,
    defaultOption,
    query,
    paramNames,
    invokeWithParams,
    indexOf,
    arrayMap,
    arrayReduce,
    propertyNames,
    compileExprForArray
};
