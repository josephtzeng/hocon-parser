const { SourceAdapter } = require ("../core/SourceAdapter");



class ContextSource extends SourceAdapter
{
    async onLoad ()
    {
        return this.context.text;
    }
}



module.exports  = { ContextSource };
