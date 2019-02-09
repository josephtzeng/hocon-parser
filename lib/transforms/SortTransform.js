const { TransformAdapter } = require ("../core/TransformAdapter");

const _ = require ("../utils");



class SortTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        let { property, expr, order } = this.$;

        order = order == "asc" ? 1 : -1;

        resolution = _.toArray (resolution);

        if (expr)
        {
            return _.arrayMap (resolution, expr)
                    .map ((v, i) => ({ el: resolution[i], v }))
                    .sort ((a, b) => ((a = a.v, b = b.v, a == b ? 0 : (order * (a < b ? -1 : 1)))))
                    .map ((v) => v.el);
        }
        else
        {
            return _.toArray (resolution)
                    .sort ((a, b) => ((a = property ? _.query (a, property) : a, b = property ? _.query (b, property) : b, a == b ? 0 : order * (a < b ? -1 : 1))));
        }
    }
}


SortTransform.defaults =
{
    expr:     "", // sort by expression or property, but not both
    property: undefined,
    order:    "asc"
};


module.exports  = { SortTransform };
