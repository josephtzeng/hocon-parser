process.$platform = "win32";

const { Context } = include ("lib/core/Context");

let parentContext = new Context ({ url: "C:\\Users\\John Doe\\tmp" });


test.func (Context, "parseUrl")
    .should ("reserve the drive letter on Windows")
    .given ("C:\\Users\\IEUser")
    .returns (
    {
        source: "file",
        url:    "file:///C:/Users/IEUser"
    })

    .given ("C:\\Users\\John Doe\\file.txt")
    .returns (
    {
        source: "file",
        url:    "file:///C:/Users/John%20Doe/file.txt"
    })

    .given ("C:\\Users\\John Doe\\file.txt", parentContext)
    .before (async function ()
    {
        await parentContext.resolve ();
    })
    .returns (
    {
        source: "file",
        url:    "file:///C:/Users/John%20Doe/file.txt"
    })
;

