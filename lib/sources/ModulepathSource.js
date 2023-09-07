const { FileSource } = require ("./FileSource");
const _ = require ("../utils");



class ModulepathSource extends FileSource
{
    static get aliases ()
    {
        return ["classpath"];
    }


    async onLoadFile ()
    {
        let ctx       = this.context;
        let path      = await _.findFile (ctx.url.path);
        let encoding  = ctx.encoding;

        return await _.readFile (path, { encoding });
    }
}



module.exports  = { ModulepathSource };
