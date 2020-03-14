const _         = require ("../utils");
const $$        = new WeakMap ();
const SEQ       = Symbol ("SEQ");
const NODE      = Symbol ("NODE");
const assert    = require ("assert");
const { Token } = require ("./Token");

const DOT_PATTERN = /(\.)/g;
const CLASSES     = [];


class Node
{
    constructor (parent, context)
    {
        this.children   = [];
        this.transforms = [];

        $$.set (this,
        {
            parent:         parent,
            closed:         false,
            lastToken:      null,
            firstToken:     null,
            closeToken:     null,
            context:        context || (parent && parent.context),
            scope:          null,
            resolved:       false,
            unresolvedPaths: []
        });

        var root  = this.root || this;
        var seq   = (root && root.$[SEQ] || 0) + 1;

        this.id     = this.constructor.name + "." + seq + "@" + _.uuid ().slice (0, 5);
        this.$[SEQ] = seq;
    }


    get $ ()
    {
        return $$.get (this);
    }


    get parent ()
    {
        return this.$.parent;
    }


    get resolution ()
    {
        return this.$.resolution;
    }


    get resolved ()
    {
        if (this.$.resolved)
        {
            for (let c of this.children)
            {
                if (c instanceof Node && !c.resolved)
                {
                    return false;
                }
            }

            return true;
        }

        return false;
    }


    get lastToken ()
    {
        return this.$.lastToken;
    }


    get firstToken ()
    {
        return this.$.firstToken;
    }


    get closeToken ()
    {
        return this.$.closeToken;
    }


    set closeToken (token)
    {
        this.$.closeToken = token;
    }


    get closed ()
    {
        return this.$.closed;
    }


    get context ()
    {
        var n = this;

        while (n && !n.$.context)
        {
            n = n.parent;
        }

        return n && n.$.context;
    }


    get scope ()
    {
        return this.$.scope;
    }


    get lastScope ()
    {
        return this.$.lastScope;
    }


    get root ()
    {
        return this.$.context && this.$.context.root.node;
    }


    get resolvingPhase ()
    {
        return this.root.$.resolvingPhase;
    }


    addChild (...children)
    {
        this.children.push (...children);

        return this;
    }


    addTransform (...transforms)
    {
        this.transforms.push (...transforms);

        return this;
    }


    append (...tokens)
    {
        let node = this;

        if (!tokens.length)
        {
            return node;
        }

        if (tokens.length > 1)
        {
            for (let token of tokens)
            {
                node  = node.append (token);
            }

            return node;
        }


        var token = tokens[0];
        var $     = this.$;

        if (!$.firstToken || $.firstToken.type == Token.TYPE.WHITESPACE)
        {
            $.firstToken = token;
        }

        $.lastToken = token;
        node = this.onAppend (token);

        if (node instanceof Node)
        {
            if (node == $.parent)
            {
                token.owner = this.id;
            }
            else
            {
                token.owner = node.id;
            }
        }
        else
        {
            this.error (`Unexpected token.`);
        }

        return node;
    }


    close (token)
    {
        var $ = this.$;

        if ($.closed)
        {
            this.error ("The node is closed already.");
        }


        $.closed      = true;
        $.closeToken  = token || $.lastToken;

        return $.parent && $.parent.onChildClose (this) || $.parent || this;
    }


    async resolve (scope = null)
    {
        scope = _.isObject (scope) ? scope : {};

        var transforms = await this.resolveTransforms (scope);

        if (!transforms)
        {
            return;
        }

        var resolution;

        if (this == this.root)
        {
            resolution = await this.resolveRoot (scope);
        }
        else
        {
            resolution = await this.resolveChild (scope);
        }

        if (_.isObject (resolution))
        {
            resolution = _.clone (resolution);
        }

        if (resolution !== undefined)
        {
            for (let t of transforms)
            {
                resolution = await t.apply (resolution);

                if (resolution === undefined)
                {
                    let ctx = this.context;
                    let tn  = t[NODE];

                    return this.addUnresolvedPath (ctx.fullPath,
                        ctx.paths,
                        tn.name.firstToken,
                        `Unable to resolve the transform '${tn.name.resolution}'.`);
                }
            }
        }

        if (resolution !== undefined)
        {
            this.$.resolved   = true;
            this.$.resolution = resolution;
        }

        return resolution;
    }


    async resolveChild (scope)
    {
        return this.onResolve (scope);
    }


    async resolveRoot (scope)
    {
        var $ = this.$;

        $.pathDivider     = "-----" + _.uuid () + "--\n";
        $.resolvingPhase  = Node.RESOLVING_PHASE.INITIALIZING;

        do
        {
            this.resetResolutionInfo (scope);
            scope = await this.onResolve ($.scope);
            $.resolvingPhase = Node.RESOLVING_PHASE.EXPANDING;
        }
        while (this.checkUpdated ());

        if ($.unresolvedPaths.length)
        {
            $.resolvingPhase = Node.RESOLVING_PHASE.FINALIZING;

            do
            {
                this.resetResolutionInfo (scope);
                scope = await this.onResolve ($.scope);
            }
            while (this.checkUpdated ());

            if ($.unresolvedPaths.length)
            {
                let { path, token, message } = $.unresolvedPaths[0];

                path = Node.formatPath (path);

                throw new Error ((message || `Unable to resolve '${path}'.`) + ` ${token}`);
            }
        }

        return scope;
    }


    // called by the root node only
    resetResolutionInfo (lastScope)
    {
        var $ = this.$;

        $.lastScope       = lastScope;
        $.scope           = {};
        $.unresolvedPaths = [];
        $.resolvedPaths   = {};
    }


    onAppend (token) // eslint-disable-line no-unused-vars
    {
        // should return the node that will accept the next token
    }


    onResolve (scope) // eslint-disable-line no-unused-vars
    {
        // This method could return any value. Return 'undefined'
        // to indicate the node is unresolved.
    }

    onChildClose (node)  // eslint-disable-line no-unused-vars
    {
        // optionally implemented by subclasses
    }


    checkUpdated ()
    {
        var $ = this.$;

        for (let p of Object.values ($.resolvedPaths))
        {
            let newValue = _.query ($.scope, p.path);
            let oldValue = _.query ($.lastScope, p.path);

            if (!_.isEqual (newValue, p.value) && !_.isEqual (newValue, oldValue))
            {
                return true;
            }
        }

        for (let p of $.unresolvedPaths)
        {
            let newValue;
            let oldValue;

            if (p.fixedUpPath)
            {
                newValue = _.query ($.scope, p.fixedUpPath);
                oldValue = _.query ($.lastScope, p.fixedUpPath);

                if (!_.isEqual (newValue, oldValue))
                {
                    return true;
                }
            }

            newValue = _.query ($.scope, p.path);
            oldValue = _.query ($.lastScope, p.path);

            if (!_.isEqual (newValue, oldValue))
            {
                return true;
            }
        }

        return false;
    }


    addResolvedPath (path, value)
    {
        var $ = this.root.$;

        $.resolvedPaths[path.join ($.pathDivider)] = { path, value };
    }


    addUnresolvedPath (fixedUpPath, path, token, message)
    {
        this.root.$.unresolvedPaths.push ({ fixedUpPath, path, token, message });
    }


    error (message, token)
    {
        var tokenText = "";

        token = token || this.lastToken;

        if (token)
        {
            tokenText = `, ${token}`;
        }

        throw new Error (`${message} (Source: ${this.id}${tokenText})`);
    }


    createNode (clazz, addChild)
    {
        var node = Node.createNode (clazz, this, this.context);

        if (addChild)
        {
            this.addChild (node);
        }

        return node;
    }


    async resolveKey (tokens, scope)
    {
        var keys        = [];
        var unresolved  = false;
        var lastIndex   = tokens.length - 1;

        for (let [i, c] of tokens.entries ())
        {
            if (c instanceof Token)
            {
                if ((i == 0 || i == lastIndex)
                    && c.type == Token.TYPE.WHITESPACE)
                {
                    continue;
                }

                if (c.quoted)
                {
                    keys.push (c.value);
                }
                else
                {
                    keys.push.apply (keys, c.value.split (DOT_PATTERN)
                        .map (Node.replaceDots)
                        .filter (Node.emptyKeyFilter));
                }
            }
            else
            {
                var key = await c.resolve (scope);

                if (key === undefined)
                {
                    unresolved = true;
                }
                else
                if (key != Node.UNSET)
                {
                    keys.push.apply (keys, (key + "").split (DOT_PATTERN)
                        .map (Node.replaceDots)
                        .filter (Node.emptyKeyFilter));
                }
                else
                {
                    keys.push (key);
                }
            }
        }

        if (!unresolved)
        {
            keys = keys.filter ((k, i) => !(k == Node.DOT && keys[i + 1] == Node.UNSET || k == Node.UNSET));

            if (keys.length && (keys[0] == Node.DOT || keys[keys.length - 1] == Node.DOT))
            {
                this.error ("A key cannot start or end with a dot.", tokens[0]);
            }

            for (let i = 1, j = keys.length - 1; i < j; ++i)
            {
                if (keys[i] == Node.DOT && keys[i + 1] == Node.DOT)
                {
                    this.error ("A key cannot contain two consecutive dots.", tokens[0]);
                }
            }



            let ks  = [];
            let i   = 0;

            for (let k of keys)
            {
                if (k == Node.DOT)
                {
                    ++i;
                }
                else
                {
                    ks[i] = (ks[i] || "") + k;
                }
            }

            keys = ks;
        }


        return unresolved ? undefined : keys;
    }


    removeTransforms ()
    {
        return this.transforms.splice (0, this.transforms.length);
    }


    async resolveTransforms (scope, transforms)
    {
        transforms = transforms || this.transforms;

        var ts = [];

        for (let node of transforms)
        {
            let t;

            if ((t = await this.context.resolveComponent (node, "transforms", scope)) === undefined)
            {
                return;
            }

            t[NODE] = node;

            ts.push (t);
        }

        return ts;
    }
}


Node.UNSET  = Symbol ("UNSET");
Node.DOT    = Symbol ("DOT");

Node.RESOLVING_PHASE  = _.toEnum ("INITIALIZING", "EXPANDING", "FINALIZING");


Node.registerNode = function (clazz)
{
    assert (typeof clazz == "function", "The parameter 'clazz' should be a function.");

    CLASSES.push (clazz);
};


Node.createNode = function (clazz, ...args)
{
    for (let c of CLASSES)
    {
        if (c.prototype instanceof clazz)
        {
            clazz = c;
            break;
        }
    }

    return new clazz (...args);
};


Node.assign = function assign (obj, key, value)
{
    var keys    = _.isArray (key) ? key.slice () : key.split (".");
    var last    = keys.pop ();
    var o       = obj;

    for (let [i, k] of keys.entries ())
    {
        let nk = i == keys.length - 1 ? last : keys[i + 1];

        if (!(Array.isArray (o[k]) && (+nk + "") === (nk + ""))
            && (o[k] === null
                || !_.isObject (o[k])))
        {
            o[k] = {};
        }

        o = o[k];
    }

    if (value === undefined)
    {
        delete o[last];
    }
    else
    if (_.isObject (o[last]) && _.isObject (value))
    {
        Node.merge (o[last], value);
    }
    else
    if (value != Node.UNSET)
    {
        o[last] = value;
    }

    return obj;
};


Node.merge = function merge (target, source)
{
    assert (_.isObject (source), "'source' must be an object");
    assert (_.isObject (target), "'target' must be an object");


    for (let key in source)
    {
        var tv  = target[key];
        var sv  = source[key];

        if (_.isObject (tv) && _.isObject (sv))
        {
            Node.merge (tv, sv);
        }
        else
        if (source.hasOwnProperty (key)
            && key != "__proto__"
            && key != "constructor")
        {
            target[key] = sv;
        }
    }

    return target;
};


Node.formatPath = function (path)
{
    if (_.isArray (path))
    {
        let ps = [];

        for (let p of path)
        {
            p += "";

            if (~p.indexOf ("."))
            {
                ps.push (`"${p}"`);
            }
            else
            {
                ps.push (p);
            }
        }

        path = ps.join (".");
    }

    return path;
};


Node.replaceDots = function (v)
{
    return v == "." ? Node.DOT : v;
};


Node.emptyKeyFilter  = function (v)
{
    return v !== "";
};


module.exports = { Node };
