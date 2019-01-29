const { TransformAdapter } = require ("../core/TransformAdapter");


class Base64DecodeTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        if (resolution instanceof Buffer)
        {
            resolution = resolution.toString ("UTF-8");
        }

        resolution = Buffer.from (resolution + "", "base64");

        return resolution.toString ("UTF-8");
    }
}


module.exports  = { Base64DecodeTransform };
