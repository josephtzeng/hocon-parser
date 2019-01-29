const { TransformAdapter } = require ("../core/TransformAdapter");


class Base64EncodeTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        if (!(resolution instanceof Buffer))
        {
            resolution = Buffer.from (resolution + "", "utf-8");
        }

        return resolution.toString ("base64");
    }
}


module.exports  = { Base64EncodeTransform };
