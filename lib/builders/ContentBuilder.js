const { Token }           = require ("../core/Token");
const { BuilderAdapter }  = require ("../core/BuilderAdapter");
const { ContentNode }     = require ("../nodes/ContentNode");



class ContentBuilder extends BuilderAdapter
{
    async build (data)
    {
        let ctx   = this.context;
        let token = new Token (Token.TYPE.VALUE, data, 1, 1, true, ctx.url);

        ctx.createNode (ContentNode).append (token);
    }
}


module.exports  = { ContentBuilder };
