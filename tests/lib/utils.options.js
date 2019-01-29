test.func (_.options)
    .should ("return options defined by defualts")
    .given ({ a: 1 }, { a: 3, b: 4 })
    .returns ({ a: 3 })

    .should ("return use an empty object if defualts is null")
    .given (null, { a: 3, b: 4 })
    .returns ({})

    .should ("throw if defualts is a primitive")
    .given (3, { a: 3, b: 4 })
    .throws ()
;
