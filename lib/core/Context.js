const { Node }              = require ("./Node");
const { Tokenizer }         = require ("./Tokenizer");
const { Token }             = require ("./Token");
const { ContentNode }       = require ("../nodes/ContentNode");
const { TransformNode }     = require ("../nodes/TransformNode");
const { SourceAdapter }     = require ("./SourceAdapter");
const { BuilderAdapter }    = require ("./BuilderAdapter");
const { TransformAdapter }  = require ("./TransformAdapter");

const _                 = require ("../utils");
const $$                = new WeakMap ();
const no_path           = require ("path");
const no_url            = require ("url");
const assert            = require ("assert");
const BINARY_EXTENSIONS = "3dm|3ds|3g2|3gp|7z|a|aac|adp|ai|aif|aiff|alz|ape|apk|ar|arj|asf|au|avi|bak|baml|bh|bin|bk|bmp|btif|bz2|bzip2|cab|caf|cgm|class|cmx|cpio|cr2|csv|cur|dat|dcm|deb|dex|djvu|dll|dmg|dng|doc|docm|docx|dot|dotm|dra|DS_Store|dsk|dts|dtshd|dvb|dwg|dxf|ecelp4800|ecelp7470|ecelp9600|egg|eol|eot|epub|exe|f4v|fbs|fh|fla|flac|fli|flv|fpx|fst|fvt|g3|gh|gif|graffle|gz|gzip|h261|h263|h264|icns|ico|ief|img|ipa|iso|jar|jpeg|jpg|jpgv|jpm|jxr|key|ktx|lha|lib|lvp|lz|lzh|lzma|lzo|m3u|m4a|m4v|mar|mdi|mht|mid|midi|mj2|mka|mkv|mmr|mng|mobi|mov|movie|mp3|mp4|mp4a|mpeg|mpg|mpga|mxu|nef|npx|numbers|o|oga|ogg|ogv|otf|pages|pbm|pcx|pdb|pdf|pea|pgm|pic|png|pnm|pot|potm|potx|ppa|ppam|ppm|pps|ppsm|ppsx|ppt|pptm|pptx|psd|pya|pyc|pyo|pyv|qt|rar|ras|raw|resources|rgb|rip|rlc|rmf|rmvb|rtf|rz|s3m|s7z|scpt|sgi|shar|sil|sketch|slk|smv|so|stl|sub|swf|tar|tbz|tbz2|tga|tgz|thmx|tif|tiff|tlz|ttc|ttf|txz|udf|uvh|uvi|uvm|uvp|uvs|uvu|viv|vob|war|wav|wax|wbmp|wdp|weba|webm|webp|whl|wim|wm|wma|wmv|wmx|woff|woff2|wrm|wvx|xbm|xif|xla|xlam|xls|xlsb|xlsm|xlsx|xlt|xltm|xltx|xm|xmind|xpi|xpm|xwd|xz|z|zip|zipx".split ("|").reduce ((a, v) => ((a["." + v] = true, a)), {});
const FILTER_PATTERN    = /^\s*([a-z][a-z0-9]+(?:-[a-z0-9]+)*)\s*(\(\s*(.*)\s*\))?\s*$/;
const QUOTE_PATTERN     = /^(")([^"]+)\1$/;
const PROTOCOL_PATTERN  = /^[a-z]+:\/\//i;
const WINDOWS           = (process.$platform || process.platform) == "win32"; // $platform is used for testing

const TRANSFORMS      = {};
const SOURCES         = {};
const BUILDERS        = {};
const REGISTRY        =
{
    transforms: TRANSFORMS,
    sources:    SOURCES,
    builders:   BUILDERS
};

const ADAPTERS  =
{
    sources:    SourceAdapter,
    builders:   BuilderAdapter,
    transforms: TransformAdapter
};

const RESOLVED        = Symbol ("RESOLVED");
const FLAGS           = ["required", "strict", "env"];
const INHERITED_FLAGS = ["strict", "env"];
const DEFAULTS        =
{
    encoding:   "UTF-8",
    strict:     false,
    env:        true,
    required:   false,
    transforms: []
};


const TASKS =
[
    "initUrl",
    "initScope",
    "initSource",
    "resolveSource",
    "loadSource",
    "initBuilder",
    "resolveBuilder",
    "expandUrl",
    "buildNode",
    "initTransforms"
];



class Context
{
    constructor (parent, opts)
    {
        if (_.isObject (parent) && !(parent instanceof Context))
        {
            opts    = parent;
            parent  = null;
        }

        var $     = _.options (Context.defaults, opts);

        $.parent  = parent;
        $.node    = null;
        $.root    = this;
        $.paths   = [];
        $.scopes  = [];
        $.tasks   = TASKS.slice ();

        $$.set (this, $);

        this.url        = null;
        this.source     = null;
        this.builder    = null;
        this.transforms = [];
        this.resolution = undefined;

        while ($.root.parent)
        {
            $.root = $.root.parent;
        }
    }


    get $ ()
    {
        return $$.get (this);
    }


    get parent ()
    {
        return this.$.parent;
    }


    get env ()
    {
        return this.$.env;
    }


    get required ()
    {
        return this.$.required;
    }


    get strict ()
    {
        return this.$.strict;
    }


    get owner ()
    {
        return this.$.owner;
    }


    get node ()
    {
        return this.$.node;
    }


    set node (n)
    {
        this.$.node = n;
    }


    get encoding ()
    {
        return this.$.encoding;
    }


    get text ()
    {
        var t = this.$.text;

        return t === undefined || t === null ? t : (t + "");
    }


    get root ()
    {
        return this.$.root;
    }


    get paths ()
    {
        return _.toArray (this.$.paths, true);
    }


    get lastEnteredPath ()
    {
        return this.$.paths.slice (-1).pop ();
    }


    get lastEnteredScope ()
    {
        return this.$.scopes.slice (-1).pop ();
    }


    get fullPath ()
    {
        var fp  = this.paths;
        var c   = this;

        while ((c = c.parent))
        {
            fp.unshift.apply (fp, c.paths);
        }

        return fp;
    }


    get scope ()
    {
        var c = this;
        var s;

        while (c && !(s = c.$.scope))
        {
           c = c.parent;
        }

        return s;
    }


    enter (path, scope)
    {
        this.$.paths.push (_.isArray (path) ? path : [path]);
        this.$.scopes.push (scope);
    }


    exit ()
    {
        this.$.paths.pop ();
        this.$.scopes.pop ();
    }


    parseData (str)
    {
        return Context.parseData (str, this.strict);
    }


    initUrl ()
    {
        var $       = this.$;
        var parent  = this.parent;

        if ($.url)
        {
            let options = Context.parseUrl ($.url, parent);

            $.url = options.url || "";

            for (let k in options)
            {
                if (k in Context.defaults && $[k] === undefined)
                {
                    $[k] = options[k];
                }
            }

            if (parent)
            {
                for (let k of INHERITED_FLAGS)
                {
                    if ($[k] === undefined)
                    {
                        $[k] = parent[k];
                    }
                }
            }

            if ($.url)
            {
                this.url = new Context.Url ($.url);
            }
        }

        var defaults = _.clone (DEFAULTS);

        for (let k in defaults)
        {
            if ($[k] === undefined)
            {
                $[k] = defaults[k];
            }
        }
    }


    async initScope ()
    {
        var $ = this.$;

        if (typeof $.scope == "string")
        {
            $.scope = await Context.resolve ({ text: $.scope }, null, null);
        }
    }


    initSource ()
    {
        var $       = this.$;
        var source  = $.source || (this.url && this.url.source) || "context";

        this.source = Context.parseSourceConfig (source, this);
    }


    async resolveSource (scope)
    {
        this.source = await this.resolveComponent (this.source, "sources", scope);
    }


    expandUrl ()
    {
        var $ = this.$;

        if ($.owner
            && this.url
            && !(this.url.href.match (FILTER_PATTERN)))
        {
            for (let url of this.builder.expandUrl (this.url))
            {
                let cc = new Context (this.parent,
                {
                    url:        url,
                    text:       $.text,
                    query:      $.query,
                    scope:      $.scope,
                    encoding:   $.encoding,
                    required:   $.required,
                    builder:    $.builder,
                    env:        $.env,
                    strict:     $.strict,
                    transforms: _.clone ($.transforms)
                });

                $.owner.addChild (cc);
            }
        }
    }


    async loadSource ()
    {
        var data  = await this.source.load ();
        var $     = this.$;

        if (data == SourceAdapter.NOT_FOUND)
        {
            if (!$.parent && $.required)
            {
                if (this.url)
                {
                    var url = no_url.parse (this.url.$.href);

                    delete url.auth;

                    throw new Error (`Source '${url.format ()}' not found.`);
                }
                else
                {
                    throw new Error (`Source not found.`);
                }
            }
            else
            {
                this.source.data = undefined;
            }
        }
    }


    initBuilder ()
    {
        var $       = this.$;
        var data    = this.source.data;
        var builder = $.builder;

        if (!builder)
        {
            builder = this.source.preferredBuilder || "config";

            if (data instanceof Buffer || typeof data == "object")
            {
                builder = "content";
            }
            else
            if (this.url && this.url.path)
            {
                let ext = no_path.extname (this.url.path);

                if (ext)
                {
                    builder = Context.defaultBuilderMap[ext.slice (1)] || "content";
                }
            }
        }

        this.builder = Context.parseBuilderConfig (builder, this);
    }


    async resolveBuilder (scope)
    {
        this.builder = await this.resolveComponent (this.builder, "builders", scope);
    }


    async buildNode ()
    {
        if (this.source.data !== undefined)
        {
            await this.builder.build (this.source.data);
        }
    }


    initTransforms ()
    {
        for (let transform of this.$.transforms)
        {
            transform = Context.parseTransformConfig (transform, this);

            this.transforms.push (transform);
        }
    }


    async resolve (scope)
    {
        var $ = this.$;
        var task;

        while ((task = $.tasks.shift ()))
        {
            await this[task] ();
        }

        var resolution = $.node ? (await $.node.resolve (scope)) : ($.required ? undefined : Node.UNSET);

        if (resolution !== undefined && resolution != Node.UNSET) // could be null
        {
            if (resolution && $.query)
            {
                resolution = _.query (resolution, $.query);
            }

            if (resolution !== undefined)
            {
                for (let tn of this.transforms)
                {
                    let t = await this.resolveComponent (tn, "transforms", scope);

                    if (t === undefined)
                    {
                        if (tn.resolution)
                        {
                            throw new Error (`Unable to resolve transform '${tn.resolution.name}'.`);
                        }
                        else
                        {
                            throw new Error (`Unable to resolve transform. ${tn.firstToken}`);
                        }
                    }

                    resolution = await t.apply (resolution);

                    if (resolution === undefined)
                    {
                        break;
                    }
                }
            }
        }

        if (!$.parent && $.required && resolution === undefined)
        {
            if (this.url)
            {
                var url = no_url.parse (this.url.$.href);

                delete url.auth;

                throw new Error (`Unable to parse the source ${url.format ()}.`);
            }
            else
            {
                throw new Error (`Unable to parse the text.`);
            }
        }

        return (!$.parent && resolution == Node.UNSET) ? undefined : resolution;
    }


    createNode (type)
    {
        return this.node = Node.createNode (type, null, this);
    }


    createContext (options, owner)
    {
        options = _.clone (options);

        if (typeof options == "string")
        {
            options = { url: options };
        }

        options.owner = owner;

        return new Context (this, options);
    }


    async resolveComponent (node, group, scope)
    {
        if (node[RESOLVED])
        {
            return node[RESOLVED];
        }

        var comp = await node.resolve (scope);

        if (!node.resolved)
        {
            return;
        }

        var clazz = REGISTRY[group][comp.name];

        if (!clazz)
        {
            throw new Error (`Invalid ${group.slice (0, -1)} '${comp.name}'.`);
        }

        return (node[RESOLVED] = new clazz (this, comp.options));
    }
}


module.exports  = { Context };



Context.defaultBuilderMap =
{
    conf:       "config",
    properties: "config",
    json:       "config",
    js:         "script"
};


Context.registerComponent = function (...clazz)
{
    for (let cls of clazz)
    {
        var ns      = _.deCamelCase (cls.name).split ("-");
        var type    = ns.pop ();
        var group   = type + "s";
        var adapter = ADAPTERS[group];

        assert (cls.prototype instanceof adapter, `The '${type}' must be an instance of ${adapter.name}.`);

        REGISTRY[group][ns.join ("-")] = cls;
    }
};


Context.defaults  =
{
    encoding: undefined,

    // The text to be parsed.
    text: undefined,

    // The context scope. It should be used for the substitution lookup
    // before the env is checked.
    scope: undefined,

    // The source URL.
    url: undefined,

    // Whether the context must resolve to a value that is not `undefined`.
    required: undefined,

    // Set to true to allow lookup from the environment variables.
    env: undefined,

    // strict mode
    //    - return values from properties file as strings
    //    - parse .3 as a string '.3'
    //    - no @?"included.conf" shortcut for include and @ for require
    //    - no | for value transformation
    strict: undefined,

    // The source config string or object.
    source: undefined,

    // The builder config string or object.
    builder: undefined,

    // An array of transform strings or objects
    transforms: undefined,

    // the owner node
    owner:  undefined,

    // the path used query the resolution
    query:  undefined
};


Context.Url = class ContextUrl
{
    constructor (url)
    {
        var $ = no_url.parse (url);

        $.source = $.protocol && $.protocol.slice (0, -1) || "file";

        if ($.auth)
        {
            $.username  = $.auth.split (":", 1)[0];
            $.password  = $.auth.slice ($.username.length + 1);
        }

        for (let k in $)
        {
            if ($[k] === null)
            {
                $[k] = "";
            }
        }

        $$.set (this, $);
    }


    get $ ()
    {
        return $$.get (this);
    }


    get source ()
    {
        return this.$.source;
    }


    get href ()
    {
        return this.toString ();
    }


    get path ()
    {
        return this.$.pathname || "";
    }


    pop ()
    {
        var basename = no_path.basename (this.$.pathname);

        this.$.pathname = no_path.dirname (this.$.pathname);

        return basename;
    }


    join (path)
    {
        this.$.pathname = no_path.join (this.$.pathname, path);
    }


    append (str)
    {
        this.$.pathname += str;
    }


    clone ()
    {
        return new Context.Url (this + "");
    }


    equals (that)
    {
        return !!(that && that.toString () == this.toString ());
    }


    toString ()
    {
        return no_url.format (this.$);
    }
};


// @return the resource options { url,
//    encoding,
//    required,
//    env,
//    strict,
//    builder,
//    source,
//    transforms
//  }
Context.parseUrl  = function (resource, parentContext)
{
    var match;

    resource += "";

    if ((match = resource.match (QUOTE_PATTERN)))
    {
        resource = match[2];
    }

    var transforms  = [];
    var result      = {};
    var url         = resource;

    if (!url)
    {
        return result;
    }

    if (!url.match (PROTOCOL_PATTERN))
    {
        while ((match = url.match (FILTER_PATTERN)))
        {
            let name    = match[1];
            let options = match[3];
            let next    = options && options.match (FILTER_PATTERN);
            let more    = next && next[3];

            if (options)
            {
                if (~FLAGS.indexOf (name))
                {
                    result[name] = true;
                }
                else
                if (SOURCES[name])
                {
                    if (result.source)
                    {
                        throw new Error ("The source can only be set once.");
                    }

                    result.source = name;
                }
                else
                if (BUILDERS[name])
                {
                    if (result.builder)
                    {
                        throw new Error ("The builder can only be set once.");
                    }

                    result.builder = name;
                }
                else
                if (TRANSFORMS[name])
                {
                    transforms.unshift (name);
                }
                else
                if (name != "url")
                {
                    throw new Error (`Invalid component '${name}'.`);
                }

                url = options;
            }

            if (more === "")
            {
                return {};
            }

            if (!more)
            {
                break;
            }
        }

        if ((match = url.match (QUOTE_PATTERN)))
        {
            url = match[2];
        }
    }

    let u     = no_url.parse (url, true);
    let root  = no_path.sep;

    if (WINDOWS
        && u.protocol
        && !u.slashes
        && no_path.win32.resolve (u.href) == url.slice (0, u.protocol.length).toLowerCase () + url.slice (u.protocol.length))
    {
        root = u.protocol;
        u.protocol = null;
        u.pathname = url;
    }

    if (!u.protocol)
    {
        var parentSource  = parentContext && parentContext.url && parentContext.url.source;
        var currentSource = result.source;

        if (currentSource && currentSource != parentSource)
        {
            u.protocol = currentSource + ":";
        }
        else
        if (parentSource)
        {
            u = no_url.parse (parentContext.source.appendPath (url), true);
        }
    }

    if (!u.protocol)
    {
        u.protocol = "file:";
    }

    if (u.protocol == "file:" && !u.slashes && !u.pathname.toLowerCase ().startsWith (root))
    {
        u.pathname = no_path.resolve (u.pathname);
    }

    u.slashes = true;

    if (!result.source)
    {
        let source = u.protocol.slice (0, -1);

        if (SOURCES[source])
        {
            result.source = source;
        }
    }

    result.url = no_url.parse (no_url.format (u)).href;

    if (transforms.length)
    {
        result.transforms = transforms;
    }

    if (u.pathname && BINARY_EXTENSIONS[no_path.extname (u.pathname)])
    {
        result.encoding = null;
    }

    return result;
};


Context.parseData = function (data, strict)
{
    return _.parseData (data, strict);
};


Context.resolve = async function (opts, scope, defaultValue)
{
    try
    {
        var context = new Context (typeof opts == "string" ? { text: opts } : opts);

        return await context.resolve (scope);
    }
    catch (e)
    {
        if (arguments.length == 3)
        {
            return defaultValue;
        }
        else
        {
            throw e;
        }
    }
};


Context.parseSourceConfig = function (config, context)
{
    return Context.parseComponentConfig ("sources", config, context);
};


Context.parseBuilderConfig = function (config, context)
{
    return Context.parseComponentConfig ("builders", config, context);
};


Context.parseTransformConfig = function (config, context)
{
    return Context.parseComponentConfig ("transforms", config, context);
};


Context.parseComponentConfig = function (group, config, context)
{
    var registry  = REGISTRY[group];
    var owner     = context.owner;


    if (!config)
    {
        return Node.createNode (ContentNode, owner, context)
            .append (new Token (Token.TYPE.VALUE, null));
    }
    else
    if (typeof config == "object")
    {
        let keys  = Object.keys (config);
        let vals  = Object.values (config);
        let name  = keys[0];
        let cname;

        if (group == "sources"
            && context.url
            && (cname = context.url.source)
            && cname != name)
        {
            config = { name: cname, options: config };
        }
        else
        {
            config = registry[name] ? { name, options: vals[0] } : config;
        }

        return Node.createNode (ContentNode, owner, context)
            .append (new Token (Token.TYPE.VALUE, config));
    }
    else
    {
        let tokenizer = new Tokenizer ();
        let tokens    = tokenizer.tokenize (config + "", context.strict);
        let tn        = Node.createNode (TransformNode, owner, context);

        tn.append (...tokens);

        return tn;
    }
};



function init ()
{
    for (let d of ["sources", "builders", "transforms"])
    {
        let files = _.readDirSync (no_path.join (__dirname, "..", d), _.readDirSync.TYPE.FILE);

        for (let f of files)
        {
            let clazz = Object.values (require (`../${d}/${f}`))[0];

            Context.registerComponent (clazz);
        }
    }
}


init ();
