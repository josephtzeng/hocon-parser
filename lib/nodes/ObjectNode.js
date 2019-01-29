const { Node } = require ("../core/Node");



class ObjectNode extends Node
{
    constructor (parent, context)
    {
        super (parent, context);

        var $     = this.$;

        $.opened  = false;
        $.started = false;
    }


    onAppend (token)
    {
        var $     = this.$;
        var type  = token.type;

        if ($.closed
            && (type == Token.TYPE.NEWLINE
                || type == Token.TYPE.WHITESPACE
                || type == Token.TYPE.COMMENT))
        {
            return this;
        }

        var children    = this.children;
        var lastChild   = children[children.length - 1];

        switch (type)
        {
            case Token.TYPE.OPEN_CURLY:
                if ($.opened || $.started)
                {
                    this.error (`The object node is opened already.`);
                }

                $.opened = true;

                return this;

            case Token.TYPE.CLOSE_CURLY:
                return this.close ();

            case Token.TYPE.WHITESPACE:
            case Token.TYPE.COMMENT:
            case Token.TYPE.NEWLINE:
                return this;

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

            case Token.TYPE.SUBSTITUTION:
            case Token.TYPE.VALUE:
            case Token.TYPE.AT:
                if (this.closed)
                {
                    this.error ("The object is already closed.");
                }

                $.started = true;

                return this.createNode (token.type == Token.TYPE.AT || !token.quoted && (token.value == "include" || token.value == "require") ? IncludeNode : FieldNode, true)
                    .append (token);
        }
    }


    onChildClose (node)
    {
        if (node.closeToken.type == Token.TYPE.CLOSE_CURLY)
        {
            return this.close (node.closeToken);
        }
        else
        {
            return this;
        }
    }

    async onResolve (scope)
    {
        if (this.$.opened && !this.closed)
        {
            this.error (`The object is not closed.`);
        }

        for (let f of this.children)
        {
            await f.resolve (scope);
        }

        return scope;
    }
}


module.exports = { ObjectNode };

const { Token }       = require ("../core/Token");
const { FieldNode }   = require ("./FieldNode");
const { IncludeNode } = require ("./IncludeNode");
