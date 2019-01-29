process.$platform = "win32";

const { Context } = include ("lib/core/Context");


test.func (Context, "parseUrl")
    .should ("reserve the drive letter on Windows")
    .given ("C:\\Users\\IEUser")
    .returns (
    {
        source: "file",
        url:    "file:///C:/Users/IEUser"
    })
;

