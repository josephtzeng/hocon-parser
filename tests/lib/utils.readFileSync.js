test.func (_.readFileSync)
    .should ("return the content of %j")
        .given (__dirname + "/../resources/test.txt")
        .returns ("test\n")

    .should ("throw when the file %j does not exist")
        .given ("abcd")
        .throws ()

    .should ("throw when %j is a directory")
        .given (__dirname)
        .throws ()
;
