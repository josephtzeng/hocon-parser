const { SourceAdapter } = require ("../core/SourceAdapter");

const no_fs   = require ("fs");
const no_url  = require ("url");
const _       = require ("../utils");



class FileSource extends SourceAdapter
{
    async onLoad ()
    {
        let encoding  = this.context.encoding;
        let data      = await this.onLoadFile ();

        if (encoding && data && data[0] == "\uFEFF")
        {
            data = data.slice (1);
        }

        return data;
    }


    async onLoadFile ()
    {
        let ctx       = this.context;
        let path      = no_url.fileURLToPath (ctx.url.href);
        let encoding  = ctx.encoding;

        if (no_fs.existsSync (path))
        {
            return await _.readFile (path, { encoding });
        }
        else
        {
            return this.notFound;
        }
    }


    hasCycle ()
    {
        let ctx = this.context;
        let url = ctx.url;
        let p   = ctx;

        while ((p = p.parent))
        {
            if (url.equals (p.url))
            {
                return true;
            }
        }

        return false;
    }


    appendPath (path)
    {
        let ctx = this.context;

        if (ctx.isPathAbsolute (path))
        {
            return path;
        }
        else
        {
            let url = ctx.url.clone ();

            url.pop ();
            url.join (path);

            return url.href;
        }
    }
}


module.exports  = { FileSource };
