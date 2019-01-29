var parse   = include ("lib/parser");
var no_path = require ("path");
var dirs    = _.readDirSync (CONFIGS_DIR, _.readDir.TYPE.DIR);

test.startServer (no_path.join (TESTS_DIR, "resources"));



async function parseConfig (opts)
{
    var result = await parse (opts);

    return JSON.parse (JSON.stringify (result));
}


for (let dir of dirs)
{
    if (dir.endsWith (".skip"))
    {
        continue;
    }

    let throws  = ~dir.indexOf (".error");
    let strict  = !~dir.indexOf (".default");

    var func  = test
        .func (parseConfig, "parse")
        .should (throws ? `throw while parsing ${dir}/test.conf` : `parse ${dir}/test.conf correctly`)
        .given ({ url: no_path.join (CONFIGS_DIR, dir, "test.conf"), strict, required: true });

    if (throws)
    {
        func.throws ();
    }
    else
    {
        func.returns (async () =>
        {
            try
            {
                return JSON.parse (await _.readFile (no_path.join (CONFIGS_DIR, dir, "result.json")));
            }
            catch (e)
            {
                try
                {
                    return require (no_path.join (CONFIGS_DIR, dir, "result.js"));
                }
                catch (e)
                {
                    return {};
                }
            }
        });
    }
}

