const { Node }        = require ("../core/Node");
const { IncludeNode } = require ("./IncludeNode");

const _ = require ("../utils");



class FieldNode extends Node
{
    constructor (parent, context)
    {
        super (parent, context);

        this.key    = null; // KeyNode
        this.value  = null; // ValueNode
        this.$.vn   = null;
    }


    onAppend (token)
    {
        var vn = this.$.vn;

        if (vn)
        {
            switch (token.type)
            {
                case Token.TYPE.WHITESPACE:
                case Token.TYPE.NEWLINE:
                case Token.TYPE.COMMENT:
                    return this;

                default:
                    this.value  = vn;
                    this.$.vn   = null;

                    if (token.type == Token.TYPE.AT
                        || (token.type == Token.TYPE.VALUE
                            && !token.quoted
                            && (token.value == "include" || token.value == "require")))
                    {
                        return this.value.createNode (IncludeNode, true).append (token);
                    }

                    return this.value.append (token);
            }
        }
        else
        {
            switch (token.type)
            {
                case Token.TYPE.SUBSTITUTION:
                case Token.TYPE.VALUE:
                    this.key  = this.createNode (KeyNode, true);

                    return this.key.append (token);
            }
        }
    }


    onChildClose (node)
    {
        var token = node.closeToken;

        if (node instanceof KeyNode)
        {
            let vn = this.createNode (ValueNode, true);

            if (token.type == Token.TYPE.ASSIGN && token.value == "+=")
            {
                vn.enableSrac (token);
            }
            else
            if (token.type == Token.TYPE.OPEN_CURLY)
            {
                return (this.value = vn).append (token);
            }

            this.$.vn = vn;

            return this;
        }
        else
        {
            return this.close (token);
        }
    }


    async onResolve (scope)
    {
        var path = await this.key.resolve (scope);

        if (path === undefined)
        {
            return;
        }

        if (!path.length)
        {
            this.error ("Invalid path!");
        }

        this.context.enter (path, scope);

        if (!this.value)
        {
            this.error ("No value specified for the field.");
        }

        var val = await this.value.resolve (_.query (scope, path));

        this.context.exit ();

        Node.assign (scope, path, val);

        return val;
    }
}


module.exports      = { FieldNode };

const { KeyNode }   = require ("./KeyNode");
const { ValueNode } = require ("./ValueNode");
const { Token }     = require ("../core/Token");

