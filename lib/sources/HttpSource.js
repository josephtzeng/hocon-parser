const { FileSource } = require ("./FileSource");

const got = require ("got");



class HttpSource extends FileSource
{
    async onLoadFile ()
    {
        let ctx       = this.context;
        let encoding  = ctx.encoding;

        try
        {
            return (await got (ctx.url.href, encoding ? { encoding } : { responseType: "buffer" })).body;
        }
        catch (e)
        {
            if (e.response.statusCode == 404)
            {
                return this.notFound;
            }
            else
            {
                throw e;
            }
        }
    }
}


module.exports  = { HttpSource };
