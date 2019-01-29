const { Node }  = require ("../core/Node");
const { Token } = require ("../core/Token");
const _         = require ("../utils");



class SubstitutionNode extends Node
{
    constructor (parent, context)
    {
        super (parent, context);

        var $ = this.$;

        $.optional  = false;
        $.opened    = false;
    }


    onAppend (token)
    {
        var $ = this.$;

        switch (token.type)
        {
            case Token.TYPE.VALUE:
            case Token.TYPE.WHITESPACE:
                return this.addChild (token);

            case Token.TYPE.SUBSTITUTION:
                if (!$.opened)
                {
                    $.opened = true;
                    $.optional = token.value[2] == "?";

                    return this;
                }
                else
                {
                    return this.createNode (SubstitutionNode, true).append (token);
                }

            case Token.TYPE.CLOSE_CURLY:
                return this.close ();
        }
    }


    async onResolve (scope)
    {
        if (!this.closed)
        {
            this.error (`The substitution is not closed.`);
        }

        var $     = this.$;
        var ctx   = this.context;
        var phase = this.resolvingPhase;

        if (phase == Node.RESOLVING_PHASE.INITIALIZING)
        {
            $.parentKeyLength = ctx.fullPath.length - ctx.paths.length;
        }

        var keys = await this.onResolveKey (scope);

        if (keys === undefined)
        {
            return;
        }

        var fp  = ctx.fullPath;
        var pk  = fp.slice (0, $.parentKeyLength);
        var sk  = keys;
        var fk; // fixed-up key
        var val;

        var fpp = fp.slice ();
        var ls  = this.root.lastScope;

        fpp.pop ();

        // make sure the no ancestor has not been set to a primitive value
        for (let p of fpp)
        {
            ls = ls[p];

            if (ls === undefined)
            {
                break;
            }
            else
            if (!_.isArray (ls) && !_.isObject (ls))
            {
                return Node.UNSET;
            }
        }

        if (pk && pk.length) // check root scopes with full path
        {
            sk  = fk = pk.concat (keys);
            val = _.query (this.root.lastScope, sk);
        }

        if (val === undefined) // check root scopes with scoped path
        {
            sk  = keys;

            if (!_.arrayStartsWith (fp, sk))
            {
                val = _.query (this.root.lastScope, sk);
            }
            else
            {
                val = _.query (this.root.scope, sk);
            }
        }

        if (val === undefined) // check local scope
        {
            let ls  = ctx.lastEnteredScope;

            if (ls)
            {
                val = _.query (ls, sk);
            }
        }

        if (val === undefined) // let subclass to try again
        {
            val = await this.onResolveFailure (scope);
        }

        var cs;

        if (val === undefined && (cs = ctx.scope))
        {
            val = _.query (cs, sk);
        }

        if (val === undefined && ctx.env) // check env
        {
            val = _.query (process.env, sk);
        }

        if (val === undefined
            && $.optional
            && phase == Node.RESOLVING_PHASE.FINALIZING)
        {
            return Node.UNSET;
        }

        if (val === undefined)
        {
            this.addUnresolvedPath (fk, sk, this.firstToken);
        }
        else
        {
            this.addResolvedPath (sk, val);
        }

        return val;
    }


    // give subclass a chance before checking env
    async onResolveFailure (scope) // eslint-disable-line no-unused-vars
    {
    }


    async onResolveKey (scope)
    {
        return this.resolveKey (this.children, scope);
    }
}


module.exports = { SubstitutionNode };
