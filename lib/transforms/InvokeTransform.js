const { TransformAdapter } = require ("../core/TransformAdapter");

const _ = require ("../utils");



class InvokeTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        let $ = this.$;
        let { func, params, args } = $;

        if (func)
        {
            func = _.query (resolution, func);
        }
        else
        {
            func = resolution;
        }

        if (typeof func != "function")
        {
            if ($.func)
            {
                throw new Error (`The property '${$.func}' of the resolution is not a function.`);
            }
            else
            {
                throw new Error (`The resolution is not a function.`);
            }
        }

        if (params)
        {
            return await _.invokeWithParams.call ({}, func, params);
        }
        else
        {
            return await func.apply ({}, args || []);
        }
    }
}


InvokeTransform.defaults =
{
    func:   "",
    params: undefined,
    args:   undefined
};


module.exports  = { InvokeTransform };
