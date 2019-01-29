const { TransformAdapter } = require ("../core/TransformAdapter");

const _ = require ("../utils");



class QueryTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        return _.query (resolution, this.$.path);
    }
}


QueryTransform.defaults =
{
    path: "" // dot-separated path
};

module.exports  = { QueryTransform };
