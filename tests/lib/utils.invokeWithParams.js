function add (x, y)
{
    return x + y;
}


function hasProp (prop)
{
    return prop in this;
}


const invokeWithParams = _.invokeWithParams;



test.func (_.invokeWithParams)
    .can ("invoke a function with an object containing the parameters")
    .given (add, { x: 3, y: 4 })
    .returns (7)
;


test.feature ("invokeWithParams")
    .given (_.invokeWithParams.call ({ x: 3, y: 4 }, hasProp, { prop: "x" }))
    .expecting ("the function to be invoked with the context object", (v) => v === true);

test.feature ("invokeWithParams")
    .given (invokeWithParams (hasProp, { prop: "x" }))
    .expecting ("the function to be invoked with a null context if this == global", (v) => v === false);
