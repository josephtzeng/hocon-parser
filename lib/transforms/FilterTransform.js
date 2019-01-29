const { TransformAdapter } = require ("../core/TransformAdapter");

const _ = require ("../utils");



class FilterTransform extends TransformAdapter
{
    constructor (context, opts)
    {
        super (context, opts);

        if (!this.$.expr)
        {
            throw new Error ("The eval expression must be set.");
        }
    }


    // variables available to the expression:
    //    $ - the element
    //    $index - the element index
    //    $array - the array
    async onApply (resolution)
    {
        return _.arrayMap (resolution, this.$.expr)
                .filter ((v) => v.result)
                .map ((v) => v.element);
    }
}


FilterTransform.defaults =
{
    expr: "" // eval expression
};


module.exports  = { FilterTransform };
