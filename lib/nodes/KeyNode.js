const { Node }  = require ("../core/Node");
const { Token } = require ("../core/Token");



class KeyNode extends Node
{
    constructor (parent, context)
    {
        super (parent, context);

        this.$.assigned = false;
    }


    onAppend (token)
    {
        var children = this.children;

        if (this.$.assigned)
        {
            switch (token.type)
            {
                case Token.TYPE.WHITESPACE:
                case Token.TYPE.NEWLINE:
                    return this;

                case Token.TYPE.ASSIGN:
                case Token.TYPE.OPEN_CURLY:
                    return this.close ();
            }
        }
        else
        {
            switch (token.type)
            {
                case Token.TYPE.SUBSTITUTION:
                    {
                        return this.createNode (SubstitutionNode, true).append (token);
                    }

                case Token.TYPE.WHITESPACE:
                case Token.TYPE.VALUE:
                    children.push (token);
                    return this;

                case Token.TYPE.COMMENT:
                    return this;

                case Token.TYPE.OPEN_CURLY:
                case Token.TYPE.ASSIGN:
                    return this.close ();

                case Token.TYPE.NEWLINE:
                    this.$.assigned = true;
                    return this;
            }
        }
    }


    async onResolve (scope)
    {
        return (this.path = this.path || await this.resolveKey (this.children, scope));
    }
}


module.exports = { KeyNode };

const { SubstitutionNode }  = require ("./SubstitutionNode");
