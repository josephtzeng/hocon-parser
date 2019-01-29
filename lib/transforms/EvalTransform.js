const { TransformAdapter } = require ("../core/TransformAdapter");



class EvalTransform extends TransformAdapter
{
    constructor (context, opts)
    {
        super (context, opts);

        if (!this.$.expr)
        {
            throw new Error ("The eval expression must be set.");
        }

        Object.assign (this.$, opts);
    }


    async onApply (resolution)
    {
        var $       = this.$;
        var params  = [];
        var args    = [];

        for (let p of Object.keys ($))
        {
            if (p != "expr")
            {
                params.push (p);
                args.push ($[p]);
            }
        }

        if (!~params.indexOf ("resolution"))
        {
            params.push ("resolution");
            args.push (resolution);
        }

        return Function.apply (null, [params].concat ("try { return " + $.expr + "; } catch (e) {};"))
            .apply (resolution, args);
    }
}


EvalTransform.defaults =
{
    expr: "" // eval expression

    // any other options will be treated as the parameters
};


module.exports  = { EvalTransform };
