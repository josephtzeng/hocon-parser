var parser  = include ("lib/parser");
var no_path = require ("path");

var dir     = no_path.join (__dirname, "../resources/app/_");
var paths   = [];
var changed = false;
var last;


do
{
    last  = dir;
    dir   = no_path.dirname (dir);

    if ((changed = last != dir))
    {
        paths.push (no_path.join (dir, "node_modules"));
    }
}
while (changed);


parser.$mode    = "lib";
parser.$require =
{
    main:
    {
        require: function (path)
        {
            for (let prefix of paths)
            {
                try
                {
                    return require (no_path.join (prefix, path));
                }
                catch (e)
                {
                }
            }

            throw new Error (`Unable to require '${path}'.`);
        }
    }
};


test.func (parser)
    .should ("load the local plugins when used as a library")
    .given ({ text: "a: 1" })
    .returns ({ a: 1 });

