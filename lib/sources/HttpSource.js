const { FileSource } = require ("./FileSource");
const rock = require ("rock-req").extend ({ keepAliveDuration: 0 });


class HttpSource extends FileSource
{
    async onLoadFile ()
    {
        let ctx = this.context;
        let encoding = ctx.encoding;
        let { response, data } = await new Promise (function (res, rej)
        {
            rock.get (ctx.url.href, function (e, response, data)
            {
                if (e)
                {
                    rej (e);
                }
                else
                {
                    res ({ response, data });
                }
            });
        });

        if ((response.statusCode + "")[0] == "2")
        {
            return encoding ? data.toString ("utf8") : data;
        }
        else
        if (response.statusCode == 404)
        {
            return this.notFound;
        }
        else
        {
            throw new Error (response.statusMessage);
        }
    }
}


module.exports  = { HttpSource };
