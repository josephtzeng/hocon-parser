const { Node }  = require ("../core/Node");
const _         = require ("../utils");


const PROPERTIES_EXT_PATTERN = /\.properties$/i;



class ValueNode extends Node
{
    constructor (parent, context)
    {
        super (parent, context);

        var $ = this.$;

        this.type     = "";

        $.sracNode    = null;
    }


    // += self-referential array concatenation
    enableSrac (token)
    {
        this.$.sracToken  = token;
        this.$.sracNode   = this.createNode (SracNode, true).init (token);
        this.type         = ValueNode.TYPE.SUBSTITUTION;
    }


    onAppend (token)
    {
        var type      = this.type;
        var children  = this.children;
        var lastChild = children[children.length - 1];


        switch (token.type)
        {
            case Token.TYPE.VALUE:
                if (!type)
                {
                    type  = this.type = ValueNode.TYPE.PRIMITIVE;
                }

                if (type == ValueNode.TYPE.PRIMITIVE || type == ValueNode.TYPE.SUBSTITUTION)
                {
                    children.push (token);
                }
                else
                {
                    this.error (`Unable to concatenate the value in the ${_.symbolString (type)} mode.`);
                }
                return this;

            case Token.TYPE.COMMENT:
                return this;

            case Token.TYPE.WHITESPACE:
                if ((type == ValueNode.TYPE.PRIMITIVE || type == ValueNode.TYPE.SUBSTITUTION)
                    && children.length)
                {
                    children.push (token);
                }
                return this;

            case Token.TYPE.OPEN_CURLY:
                if (!type || type == ValueNode.TYPE.OBJECT || type == ValueNode.TYPE.SUBSTITUTION)
                {
                    this.type = type || ValueNode.TYPE.OBJECT;

                    return this.createNode (ObjectNode, true).append (token);
                }
                else
                {
                    this.error (`Unable to start an object in the ${_.symbolString (type)} mode.`);
                }

            case Token.TYPE.COMMA:        // eslint-disable-line no-fallthrough
            case Token.TYPE.CLOSE_CURLY:  // eslint-disable-line no-fallthrough
            case Token.TYPE.CLOSE_SQUARE:
                return this.close ();

            case Token.TYPE.NEWLINE:
                return children.length ? this.close () : this;

            case Token.TYPE.PIPE:
                if (!lastChild)
                {
                    this.addChild (new Token (Token.TYPE.VALUE, "", token.line, token.col, false, token.file));
                    this.type = ValueNode.TYPE.PRIMITIVE;
                }

                this.addTransform (lastChild = this.createNode (TransformNode));

                return lastChild;

            case Token.TYPE.SUBSTITUTION:
                this.type = ValueNode.TYPE.SUBSTITUTION;

                return this.createNode (SubstitutionNode, true).append (token);


            case Token.TYPE.OPEN_SQUARE:
                if (!type || type == ValueNode.TYPE.ARRAY || type == ValueNode.TYPE.SUBSTITUTION)
                {
                    this.type = type || ValueNode.TYPE.ARRAY;

                    return this.createNode (ArrayNode, true).append (token);
                }
                else
                {
                    this.error (`Unable to start an array in the ${_.symbolString (type)} mode.`);
                }
        }
    }


    async onResolve (scope)
    {
        var type    = (this.type || ValueNode.TYPE.SUBSTITUTION).toString ().slice (7, -1);
        var method  = "resolve" + type[0] + type.slice (1).toLowerCase () + "s";
        var result  = await this[method] (scope);

        return result;
    }


    async resolveSubstitutions (scope)
    {
        var srac        = this.$.sracNode;
        var unresolved  = false;
        var values      = [];
        var valueTypes  = {};
        var unset       = false;
        var objScope    = {};
        var lastIndex   = this.children.length - 1;
        var sracValue;


        for (let [i, c] of this.children.entries ())
        {
            if (c instanceof Token
                && (i == 0 || i == lastIndex || valueTypes.array || valueTypes.object)
                && c.type == Token.TYPE.WHITESPACE)
            {
                continue;
            }

            let v = c instanceof Token ? c.value : (await c.resolve (c instanceof ObjectNode ? objScope : scope));

            if (v === undefined)
            {
                unresolved = true;
            }
            else
            {
                if (v == Node.UNSET)
                {
                    unset = true;
                    continue;
                }
                else
                if (_.isArray (v))
                {
                    valueTypes.array = true;
                }
                else
                if (_.isObject (v))
                {
                    valueTypes.object = true;
                }
                else
                if (c instanceof Token && c.type == Token.TYPE.WHITESPACE && !valueTypes.primitive)
                {
                    continue;
                }
                else
                {
                    valueTypes.primitive = true;
                }

                values.push (v);
            }
        }

        if (unresolved)
        {
            return;
        }

        var types = Object.keys (valueTypes);

        if (!types.length && unset)
        {
            return Node.UNSET;
        }

        if (srac)
        {
            if (types.length > 1)
            {
                types.shift ();
            }

            sracValue = values.shift ();
        }

        if (types.length > 1)
        {
            this.error (`Unable to merge the following types: ${types.join (", ")}.`, this.firstToken);
        }

        var type = types[0];
        var res,
            value;

        switch (type)
        {
            case "primitive":
                if (values.length == 1)
                {
                    res = values[0];
                }
                else
                {
                    value = "";

                    for (let v of values)
                    {
                        value += v;
                    }

                    res = this.context.parseData (value);
                }
                break;

            case "array":
                value = [];

                for (let v of values)
                {
                    value = value.concat (v);
                }

                res = value;
                break;

            case "object":
                value = {};

                for (let v of values)
                {
                    for (let i in v)
                    {
                        value[i] = v[i];
                    }
                }
                res = value;
                break;
        }

        if (srac)
        {
            if (!_.isArray (sracValue))
            {
                this.error (`Self-referential substitutions can only be applied to a non-array value '${JSON.stringify (sracValue)}'.`, this.$.sracToken);
            }

            sracValue.push (res);

            res = sracValue;
        }

        return res;
    }


    async resolvePrimitives ()
    {
        let ctx       = this.context;
        let props     = (ctx.url + "").match (PROPERTIES_EXT_PATTERN);
        let value     = "";
        let quoted    = false;
        let lastIndex = this.children.length - 1;

        for (let [i, t] of this.children.entries ())
        {
            if ((i == 0 || i == lastIndex)
                && t.type == Token.TYPE.WHITESPACE)
            {
                continue;
            }

            value += t.value;

            if (t.quoted)
            {
                quoted = true;
            }
        }

        return (quoted || (ctx.strict && props)) ? value : ctx.parseData (value);
    }


    async resolveArrays (scope)
    {
        let value = [];
        let unresolved  = false;

        for (let a of this.children)
        {
            let v = await a.resolve (scope);

            if (v === undefined)
            {
                unresolved = true;
            }

            value = value.concat (v);
        }

        return unresolved ? undefined : value;
    }


    async resolveObjects (scope)
    {
        for (let o of this.children)
        {
            await o.resolve (scope);
        }

        return scope;
    }


    onChildClose (node)
    {
        if (node instanceof TransformNode)
        {
            let type = node.closeToken.type;

            if (type == Token.TYPE.NEWLINE || type == Token.TYPE.COMMA)
            {
                return this.close (node.closeToken);
            }
            else
            if (type == Token.TYPE.PIPE)
            {
                let transform = this.createNode (TransformNode);

                this.addTransform (transform);

                return transform;
            }

            return this;
        }
        else
        if (node instanceof IncludeNode)
        {
            return this.close (node.closeToken);
        }
    }
}


ValueNode.TYPE  = _.toEnum ("PRIMITIVE", "ARRAY", "OBJECT", "SUBSTITUTION");

module.exports  = { ValueNode };

const { Token }             = require ("../core/Token");
const { ArrayNode }         = require ("./ArrayNode");
const { ObjectNode }        = require ("./ObjectNode");
const { SubstitutionNode }  = require ("./SubstitutionNode");
const { IncludeNode }       = require ("./IncludeNode");
const { TransformNode }     = require ("./TransformNode");
const { SracNode }          = require ("./SracNode");
