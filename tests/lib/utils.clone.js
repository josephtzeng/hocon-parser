var o1 = { a: 3 };


test.func (_.clone)
    .should ("return the cloned object")
    .given (o1)
    .returns (o1)
    .expecting ("the returned object is not the original object", function (out)
    {
        out.b = 4;

        return out.b !== o1.b;
    })

    .should ("return the original value if the input is a primitive")
    .given (3)
    .returns (3)

;


