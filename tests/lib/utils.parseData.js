test.func (_.parseData)

    .should ("parse a string @data = %j into a corresponding JSON value %j")
        .given ("a.z")
        .returns ("a.z")

        .given ("true")
        .returns (true)

        .given ("true01")
        .returns ("true01")

        .given ("3.1")
        .returns (3.1)

        .given ("10e2")
        .returns (1000)

        .given ("false")
        .returns (false)

        .given ("null")
        .returns (null)

        .given ("undefined")
        .returns ("undefined")

    .should ("return the original @data = %j if it's not a string")
        .given (1)
        .returns (1)

        .given (undefined)
        .returns (undefined)

        .given ({a: 1})
        .returns ({a: 1})

        .given ([3, 4])
        .returns ([3, 4])
;
