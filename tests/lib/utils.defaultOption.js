class A
{
}

A.defaults =
{
    a: "a"
};


class B
{
}

B.defaults =
{
    ...A.defaults,
    b: "b"
};


class C
{
}


test.func (_.defaultOption)
    .should ("return the name of the first default option of a class")
    .given (A)
    .returns ("a")

    .given (B)
    .returns ("a")

    .should ("return `undefined` if the class does not define any defaults")
    .given (C)
    .returns (undefined)
;
