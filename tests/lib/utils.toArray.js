(function ()
{
    test.func (_.toArray)

        .should ("convert arguments %j to an array %j")
            .given (arguments)
            .returns ([3, 4, 5])

        .should ("convert primitives %j to an array %j")
            .given (3)
            .returns ([3])

            .given (null)
            .returns ([])

            .given (undefined)
            .returns ([])

            .given (0)
            .returns ([0])

            .given ("")
            .returns ([""])

            .given ("str")
            .returns (["str"])

        .should ("flatten a nested array %j to %2:j if @flatten = %1:j")
            .given ([[3, 4] , 5], true)
            .or ([[3, 4, 5], []], {})
            .or ([3, 4, 5], "true")
            .or ([[[3, 4]], [5]], "true")
            .or ([[[3, 4]], [[[[5]]]]], true)
            .returns ([3, 4, 5])
    ;
}) (3, 4, 5);
