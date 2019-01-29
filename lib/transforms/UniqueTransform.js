const { TransformAdapter } = require ("../core/TransformAdapter");

const _ = require ("../utils");



class UniqueTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        return _.toArray (resolution)
                .filter ((v, i, a) => _.indexOf (a, v) == i);
    }
}



module.exports  = { UniqueTransform };
