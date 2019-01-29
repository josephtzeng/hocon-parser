test.func (_.indexOf)
    .should ("return -1 if the element is not found in the array")
    .given ([1, 2, 3], 5)
    .returns (-1);
