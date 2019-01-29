const { Node }  = require ("../core/Node");
const { Token } = require ("../core/Token");
const _         = require ("../utils");


class IncludeNode extends Node
{
    constructor (parent, context)
    {
        super (parent, context);

        this.sourceNode = "";

        var $ = this.$;

        $.resource  = null;
        $.required  = false;
    }


    onAppend (token)
    {
        switch (token.type)
        {
            case Token.TYPE.AT:
            case Token.TYPE.VALUE:
                this.$.required = token.value == "require" || token.value == "@";

                return this.sourceNode = this.createNode (ValueNode);
        }
    }


    onChildClose (node)
    {
        return this.close (node.closeToken);
    }


    async onResolve (scope)
    {
        var $   = this.$;
        var ctx = this.context;

        if (!$.transforms)
        {
            if (!($.transforms = await this.resolveTransforms (scope, this.sourceNode.transforms)))
            {
                return;
            }

            this.sourceNode.removeTransforms ();
        }

        if (!$.included)
        {
            $.resource = await this.sourceNode.resolve ();

            if (!this.sourceNode.resolved)
            {
                return;
            }

            if (typeof $.resource == "object" && !$.resource.url)
            {
                this.error ("Resource URL is required.");
            }

            this.addChild (ctx.createContext ($.resource, this));

            $.included  = true;
        }

        var results     = [];
        var types       = {};
        var unresolved  = false;

        // could be including multiple files
        for (let c of this.children)
        {
            let r = await c.resolve (scope);

            $.required = $.required || c.required;
            unresolved = r === undefined || unresolved;

            if (r != Node.UNSET && r !== undefined)
            {
                for (let t of $.transforms)
                {
                    r = await t.apply (r);

                    if (r === undefined)
                    {
                        unresolved = true;
                        break;
                    }
                }
            }

            if (r != Node.UNSET && r !== undefined)
            {
                results.push (r);

                types[_.isObject (r) ? "object" : (_.isArray (r) ? "array" : "primitive")] = true;
            }
        }

        if (!results.length || unresolved)
        {
            if ($.required)
            {
                return this.addUnresolvedPath (ctx.fullPath,
                    ctx.paths,
                    this.sourceNode.firstToken,
                    `Unable to include the resource ${JSON.stringify ($.resource)}.`);
            }
            else
            {
                return Node.UNSET;
            }
        }

        let ts = Object.keys (types);

        if (ts.length > 1)
        {
            this.error (`Unable to merge the following types: ${ts.join (", ")}.`, this.firstToken);
        }

        if (types.object)
        {
            return scope;
        }
        else
        if (types.array)
        {
            let arr = [];

            for (let a of results)
            {
                arr = arr.concat (a);
            }

            return arr;
        }
        else
        {
            var str = "";

            for (let s of results)
            {
                str += s;
            }

            return ctx.parseData (str);
        }
    }
}


module.exports = { IncludeNode };

const { ValueNode } = require ("./ValueNode");
