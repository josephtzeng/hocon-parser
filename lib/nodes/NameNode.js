const { Node }  = require ("../core/Node");
const { Token } = require ("../core/Token");



class NameNode extends Node
{
    onAppend (token)
    {
        switch (token.type)
        {
            case Token.TYPE.WHITESPACE:
            case Token.TYPE.VALUE:
                return this.addChild (token);

            case Token.TYPE.NEWLINE:
            case Token.TYPE.COMMA:
            case Token.TYPE.ASSIGN:
            case Token.TYPE.OPEN_CURLY:
            case Token.TYPE.COMMENT:
            case Token.TYPE.PIPE:
                return this.close ();

            case Token.TYPE.SUBSTITUTION:
                return  this.createNode (SubstitutionNode, true).append (token);
        }
    }


    async onResolve (scope)
    {
        var key = await this.resolveKey (this.children, scope);

        return (this.name = (!key || !key.length) ? undefined : key.join (""));
    }
}


module.exports = { NameNode };

const { SubstitutionNode }  = require ("./SubstitutionNode");
