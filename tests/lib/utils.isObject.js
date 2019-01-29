function A () {}

test.func (_.isObject)

    .should ("return true when %j is an object")
        .given (new A)
        .given ({})
        .returns (true)

    .should ("return false when %j is NOT an object")
        .given ([])
        .given (3)
        .given (null)
        .given (undefined)
        .given ("string")
        .returns (false)

    .should ("return false when %s is NOT an object")
        .given (A)
        .returns (false)
;
