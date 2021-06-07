const { FileSource } = require ("./FileSource");

const fetch = require ("node-fetch");



class HttpSource extends FileSource
{
    async onLoadFile ()
    {
        let ctx       = this.context;
        let encoding  = ctx.encoding;
        let response  = await fetch (ctx.url.href);

        if (response.ok)
        {
            if (encoding)
            {
                let text = await response.text ();

                return text;
            }
            else
            {
                return await response.buffer ();
            }
        }
        else
        if (response.status == 404)
        {
            return this.notFound;
        }
        else
        {
            throw new Error (response.statusText);
        }
    }
}


module.exports  = { HttpSource };
