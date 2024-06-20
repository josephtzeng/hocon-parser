const $$  = new WeakMap ();
const _   = require ("../utils");


class TransformAdapter
{
    constructor (context, opts)
    {
        this.context = context;

        $$.set (this, _.options (this.constructor.defaults, opts));
    }


    get $ ()
    {
        return $$.get (this);
    }


    async apply (resolution)
    {
        var $ = this.$;

        if ($.lastInput === undefined || !_.isEqual ($.lastInput, resolution))
        {
            $.lastOutput = await this.onApply ($.lastInput = resolution);
        }

        return $.lastOutput;
    }


    async onApply (resolution) // eslint-disable-line no-unused-vars
    {
    }
}


module.exports  = { TransformAdapter };
