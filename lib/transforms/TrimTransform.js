const { TransformAdapter } = require ("../core/TransformAdapter");


class TrimTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        if (resolution instanceof Buffer)
        {
            resolution = resolution.toString ("utf-8");
        }

        return (resolution + "").trim ();
    }
}


module.exports  = { TrimTransform };
