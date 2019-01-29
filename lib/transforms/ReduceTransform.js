const { TransformAdapter } = require ("../core/TransformAdapter");

const _ = require ("../utils");



class ReduceTransform extends TransformAdapter
{
    constructor (context, opts)
    {
        super (context, opts);

        if (!this.$.expr)
        {
            throw new Error ("The reduce expression must be set.");
        }
    }


    // variables available to the expression:
    //    $ - the element
    //    $accumulator - the accumulator
    //    $index - the element index
    //    $array - the array
    async onApply (resolution)
    {
        let { initValue, expr } = this.$;

        return _.arrayReduce (resolution, expr, initValue);
    }
}


ReduceTransform.defaults =
{
    expr:       "",
    initValue:  undefined
};


module.exports  = { ReduceTransform };
