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
        var arr = _.toArray (resolution);

        return _.arrayMap (arr, this.$.expr)
                .reduce ((a, e, i) =>
                {
                    if (e)
                    {
                        a.push (arr[i]);
                    }

                    return a;

                }, []);
    }
}


FilterTransform.defaults =
{
    expr: "" // eval expression
};


module.exports  = { FilterTransform };
