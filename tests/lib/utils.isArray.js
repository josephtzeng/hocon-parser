test.func (_.isArray)
    .should ("return true when @v = %j is an array")
        .given ([])
        .given ([3])
        .returns (true)

    .should ("return false when @v = %j is not an array")
        .given (null)
        .given (undefined)
        .given ({ length: 3 })
        .given (function () {})
        .returns (false)
;
