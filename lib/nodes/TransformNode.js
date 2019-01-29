const { Node }  = require ("../core/Node");
const { Token } = require ("../core/Token");



class TransformNode extends Node
{
    constructor (parent, context)
    {
        super (parent, context);

        this.name   = null; // NameNode
        this.value  = null; // ObjectNode
    }


    onAppend (token)
    {
        if (!this.name)
        {
            switch (token.type)
            {
                case Token.TYPE.SUBSTITUTION:
                case Token.TYPE.WHITESPACE:
                case Token.TYPE.VALUE:
                    this.name = this.createNode (NameNode, true);

                    return this.name.append (token);
            }
        }
        else
        {
            switch (token.type)
            {
                case Token.TYPE.OPEN_CURLY:
                    return (this.value = this.createNode (ObjectNode, true));

                case Token.TYPE.WHITESPACE:
                case Token.TYPE.COMMENT:
                case Token.TYPE.NEWLINE:
                    return this;
            }
        }
    }


    onChildClose (node)
    {
        var token = node.closeToken;

        if (node instanceof NameNode)
        {
            let type  = token.type;

            if (type == Token.TYPE.ASSIGN)
            {
                return this;
            }
            else
            if (type == Token.TYPE.OPEN_CURLY)
            {
                return (this.value = this.createNode (ObjectNode, true)).append (token);
            }
        }

        return this.close (token);
    }


    async onResolve (scope)
    {
        var name = await this.name.resolve (scope);

        if (name === undefined)
        {
            return;
        }

        var options;

        if (this.value)
        {
            options = await this.value.resolve (scope);
        }

        return { name, options };
    }
}



module.exports = { TransformNode };


const { ObjectNode }  = require ("./ObjectNode");
const { NameNode }    = require ("./NameNode");
