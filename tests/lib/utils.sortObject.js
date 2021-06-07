const obj1 = { z: 1, a: 2};

const obj2 = { z: 1, a: 2, x: { e: 3, c: 4 }};


test.func (_.sortObject)

    .should ("sort the object %j by keys to %j")
        .given (obj1)
        .returns (obj1)
            .having ("keys a and z", (o) => Object.keys (o), ["a", "z"])

        .given (obj2)
        .returns (obj2)
            .having ("keys c and e", (o) => Object.keys (o.x), ["c", "e"])

    .should ("throw if @obj = %j is not an object or array")
        .given (null)
        .given (3)
        .given ("abc")
        .throws ()
;
