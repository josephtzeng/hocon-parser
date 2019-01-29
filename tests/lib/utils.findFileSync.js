var no_path = require ("path");



test.func (_.findFileSync)

    .should ("find the file %j if it is under the module paths")
        .given ("lib/utils.js")
        .returns (no_path.join (__dirname, "../../lib/utils.js"))

    .should ("return undefined when the file %j does not exist")
        .given ("abc")
        .or ("../../non-existent")
        .or ("")
        .returns (undefined)

    .should ("return undefined when the file %j is directory")
        .given ("/")
        .or ("../../")
        .returns (undefined)

    .should ("throw when the file param %j is not a string")
        .given (3)
        .or ({})
        .or ([])
        .throws ()
  ;
