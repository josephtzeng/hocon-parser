const { Node }              = require ("../core/Node");
const { Token }             = require ("../core/Token");
const { SubstitutionNode }  = require ("./SubstitutionNode");

const _ = require ("../utils");



class SracNode extends SubstitutionNode
{
    init (token)
    {
        let { line, col, file } = token;

        this.append (new Token (Token.TYPE.SUBSTITUTION, "${?", line, col, false, file))
            .append (new Token (Token.TYPE.VALUE, "", line, col, false, file))
            .append (new Token (Token.TYPE.CLOSE_CURLY, "}", line, col, false, file));

        return this;
    }


    async onResolve (scope)
    {
        var r = await super.onResolve (scope);

        return r === undefined || r == Node.UNSET ? [] : r;
    }


    async onResolveFailure (scope) // eslint-disable-line no-unused-vars
    {
        let ctx = this.context;
        let lp  = ctx.lastEnteredPath;
        let ls  = ctx.lastEnteredScope;

        return _.query (ls, lp);
    }


    async onResolveKey (scope) // eslint-disable-line no-unused-vars
    {
        return this.context.fullPath;
    }
}


module.exports = { SracNode };
