test.func (_.options)
    .should ("return options defined by defaults")
    .given ({ a: 1 }, { a: 3, b: 4 })
    .returns ({ a: 3 })

    .should ("return use an empty object if defaults is null")
    .given (null, { a: 3, b: 4 })
    .returns ({})

    .should ("throw if defaults is a primitive")
    .given (3, { a: 3, b: 4 })
    .throws ()
;
