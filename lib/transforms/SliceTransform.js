const { TransformAdapter } = require ("../core/TransformAdapter");

const _ = require ("../utils");



class SliceTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        var arr             = _.toArray (resolution);
        var { begin, end }  = this.$;
        var range           = [];

        if (begin === undefined && end === undefined)
        {
            range.push (0);
        }
        else
        if (begin === undefined)
        {
            range.push (end);
        }
        else
        if (end === undefined)
        {
            range.push (begin);
        }
        else
        {
            range.push (begin, end);
        }

        return arr.slice.apply (arr, range);
    }
}


SliceTransform.defaults =
{
    begin:  undefined,
    end:    undefined
};


module.exports  = { SliceTransform };
