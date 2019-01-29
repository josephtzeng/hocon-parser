var no_path   = require ("path");
var setupFile = no_path.normalize (__dirname + "/../setup/core/TestFunc.js");


function callMe (pos)
{
    return _.callerFile (pos);
}

function callAgain (pos)
{
    return callMe (pos);
}


test.func (callAgain, "callerFile")

    .should ("return the file name that invokes the current function")
        .returns (setupFile)

    .should ("return the file name of the caller on invalid position %j")
        .given (-1)
        .or ("abc")
        .or ({})
        .returns (setupFile)

    .should ("return the file at a valid position '%j'")
        .given (0)
        .returnsType ("string")
        .expecting ("the file starts with the dirname", (p) => p.indexOf (no_path.dirname (__dirname)) === 0)

        .given (1)
        .returns (setupFile)

        .given (2)
        .returns (expect.stringMatching ("jest"))

    .should ("throw if the position %j is larger than the stack size")
        .given (1000)
        .throws ()
;
