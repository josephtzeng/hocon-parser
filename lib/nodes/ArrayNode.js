const { Node } = require ("../core/Node");



class ArrayNode extends Node
{
    constructor (parent, context)
    {
        super (parent, context);

        this.$.opened = false;
    }


    onAppend (token)
    {
        var children    = this.children;
        var lastChild   = children[children.length - 1];

        switch (token.type)
        {
            case Token.TYPE.OPEN_SQUARE:
                if (this.closed)
                {
                    this.error ("The array has been closed.");
                }

                if (this.$.opened)
                {
                    return this.createNode (ArrayNode, true).append (token);
                }
                else
                {
                    this.$.opened = true;

                    return this;
                }

            case Token.TYPE.NEWLINE:
            case Token.TYPE.COMMENT:
                    return this;

            case Token.TYPE.CLOSE_SQUARE:
                return this.close ();

            case Token.TYPE.COMMA:
                if (lastChild
                    && lastChild.closed
                    && lastChild.closeToken.type != Token.TYPE.COMMA)
                {
                    lastChild.closeToken = token;

                    return this;
                }
                else
                {
                    return;
                }

            case Token.TYPE.WHITESPACE:
                return this;

            case Token.TYPE.OPEN_CURLY:
            case Token.TYPE.VALUE:
            case Token.TYPE.SUBSTITUTION:
                if (this.closed)
                {
                    this.error ("The array has been closed.");
                }

                return this.createNode (ValueNode, true).append (token);
        }
    }


    onChildClose (node)
    {
        if (!(node instanceof ArrayNode) && node.lastToken.type == Token.TYPE.CLOSE_SQUARE)
        {
            return this.close (node.lastToken);
        }
    }


    async onResolve (scope)
    {
        if (!this.closed)
        {
            this.error (`The array is not closed.`);
        }

        var result      = [];
        var i           = 0;
        var unresolved  = false;

        for (let n of this.children)
        {
            this.context.enter (i, scope);

            var v = await n.resolve ();

            if (v === undefined)
            {
                unresolved = true;
            }
            else
            if (v != Node.UNSET)
            {
                result.push (v);
                ++i;
            }

            this.context.exit ();
        }

        return unresolved ? undefined : result;
    }
}


module.exports = { ArrayNode };

const { Token }     = require ("../core/Token");
const { ValueNode } = require ("./ValueNode");
