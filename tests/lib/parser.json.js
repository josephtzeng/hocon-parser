var parse   = include ("lib/parser");
var no_path = require ("path");


for (let type of ["passed", "not-passed"])
{
    let dir   = no_path.join (TESTS_DIR, "/resources/json-tests/", type);
    let files = _.readDirSync (dir, _.readDir.TYPE.FILE);

    for (let f of files)
    {
        if (f[0] == ".")
        {
            continue;
        }

        let throws  = type == "not-passed";
        let file    = no_path.join (dir, f);

        let func  = test
            .func (parse)
            .should (throws ? `throw while parsing ${file}` : `parse ${file} correctly`)
            .given ({ url: file });

        if (throws)
        {
            func.throws ();
        }
        else
        {
            func.returns (() => require (file));
        }
    }
}
