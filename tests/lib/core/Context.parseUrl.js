const { Context } = include ("lib/core/Context");

var no_path = require ("path");
var no_url  = require ("url");
var cwd     = process.cwd ();


function sourceWithCwd (path)
{
    return {
        url:    no_url.pathToFileURL (no_path.join (cwd, path + "")).href,
        source: "file"
    };
}


function sourceWithAbsPath (path)
{
    return {
        url:    no_url.pathToFileURL (path).href,
        source: "file"
    };
}


test.func (Context, "parseUrl")
    .should ("throw when the URL is %j")

    .given ('file(modulepath(content("/tests/resources/configs/simple/test.conf")))')
    .throws (/can only be set once/i)

    .given (__filename)
    .returns (
    {
        source: "file",
        url:    no_url.parse ("file://" + no_path.normalize ("/" + __filename)).href
    })
;


test.func (Context, "parseUrl")
    .should ("parse the URL %j to %j")

    .given ('content(modulepath("/tests/resources/configs/simple/test.conf"))')
    .returns ({ source: "modulepath", builder: "content", url: "modulepath:///tests/resources/configs/simple/test.conf" })

    .given ("content ()")
    .returns ({})

    .given ("content")
    .returns ({ url: sourceWithCwd ("content").url, source: "file" })

    .given ("required ()")
    .returns ({})

    .given ("required (content (    ))")
    .returns ({})

    .given ("required (content ())")
    .returns ({})

    .given ("included")
    .returns ({ url: sourceWithCwd ("included").url, source: "file" })

    .given (`required (url("http://localhost:1234/configs/includes/test.conf"))`)
    .returns ({ required: true, url: "http://localhost:1234/configs/includes/test.conf", source: "http" })

    .given ("")
    .returns ({})

    .given (9)
    .returns (sourceWithCwd (9))

    .given ("a.txt")
    .returns (sourceWithCwd ("a.txt"))

    .given ('"/test.conf"')
    .returns (sourceWithAbsPath ("/test.conf"))

    .given ('/test.conf')
    .returns (sourceWithAbsPath ("/test.conf"))

    .given ("required (a.txt)")
    .returns ({ ...sourceWithCwd ("a.txt"), required: true })

    .given ("strict (required (a.conf))")
    .returns ({ ...sourceWithCwd ("a.conf"), required: true, strict: true })

    .given (`required(file("test"))`)
    .returns ({ ...sourceWithCwd ("test"), required: true, source: "file" })

    .given (`required(url("http://example.com/resource.json"))`)
    .returns ({ url: "http://example.com/resource.json", required: true, source: "http" })

    .given (`required("http://example.com/resource.json")`)
    .returns ({ url: "http://example.com/resource.json", required: true, source: "http" })

    .given (`file:a.txt`)
    .returns (sourceWithCwd ("a.txt"))

    .given ("file:" + no_path.join (__dirname, "../../resources/dir with spaces/test.json"))
    .returns (sourceWithCwd ("tests/resources/dir with spaces/test.json"))

    .given (`required(modulepath("resource.json"))`)
    .returns ({ url: "modulepath:///resource.json", source: "modulepath", required: true })

    .given (`required(modulepath(resource.json))`)
    .returns ({ url: "modulepath:///resource.json", source: "modulepath", required: true })

    .given (`required("modulepath:///resource.json")`)
    .returns ({ url: "modulepath:///resource.json", source: "modulepath", required: true })

    .given (`modulepath ( required (resource.json))`)
    .returns ({ url: "modulepath:///resource.json", source: "modulepath", required: true })

    .given (`modulepath:///resource.json`)
    .returns ({ url: "modulepath:///resource.json", source: "modulepath" })

    .given (`"modulepath:///resource.json"`)
    .returns ({ url: "modulepath:///resource.json", source: "modulepath" })

    .given (`"http://example.com/resource.json"`)
    .returns ({ url: "http://example.com/resource.json", source: "http" })
;

