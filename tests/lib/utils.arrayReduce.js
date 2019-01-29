test.func (_.arrayReduce)
    .should ("return an empty array if the input is an empty array")
    .given ([])
    .returns ([])

    .should ("use the first array element if the initValue is not specified")
    .given ([1, 2, 3], "$ + $accumulator")
    .returns (6)
;
