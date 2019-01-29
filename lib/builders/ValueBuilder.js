const { BuilderAdapter }  = require ("../core/BuilderAdapter");
const { Tokenizer }       = require ("../core/Tokenizer");
const { ValueNode }       = require ("../nodes/ValueNode");



class ValueBuilder extends BuilderAdapter
{
    async build (data)
    {
        var ctx       = this.context;
        var tokenizer = new Tokenizer (ctx.url && ctx.url.href);
        var tokens    = tokenizer.tokenize (data, ctx.strict);

        ctx.createNode (ValueNode).append (...tokens);
    }
}


module.exports  = { ValueBuilder };
