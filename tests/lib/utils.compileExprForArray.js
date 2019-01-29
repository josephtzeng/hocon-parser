test.func (_.compileExprForArray)
    .should ("return a function for array mapping")
    .given ([1, 2], "a + b")
    .returnsType (Function)
;
