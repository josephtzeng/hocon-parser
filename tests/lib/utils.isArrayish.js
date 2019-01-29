(function ()
{
    test.func (_.isArrayish)
        .should ("return true when @v = %j is an array")
            .given ([])
            .given ([3])
            .returns (true)

        .should ("return true when @v = %s is an object and has length property")
            .given ({ length: 3 })
            .given (arguments)
            .returns (true)

        .should ("return false when @v = %j is not an array")
            .given (null)
            .given (undefined)
            .given (function () {})
            .returns (false)
    ;

}) ();
