const { TransformAdapter } = require ("../core/TransformAdapter");

const no_crypto = require ("crypto");


class HashTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        if (!(resolution instanceof Buffer) && (typeof resolution == "object"))
        {
            resolution = JSON.stringify (resolution);
        }

        return no_crypto.createHash (this.$.algorithm)
            .update (resolution)
            .digest (this.$.digest);
    }
}


HashTransform.defaults =
{
    algorithm:  "sha256",
    digest:     "hex"
};


module.exports  = { HashTransform };
