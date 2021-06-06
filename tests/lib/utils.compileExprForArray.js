test.func (_.compileExprForArray)
    .should ("return a function for array mapping")
    .given ([1, 2], "a + b")
    .returnsType (Function)

    .should ("return %3:j when array = %0:j, expr = %1:j, params = %2:j")
    .given ([{ a: 1, b: 2 }, { a: 3, b: 4, c: 5 }], "a > b", [])
    .returnsType (Function)
    .expecting ("the function takes 3 parameters", (out) => out.length == 3)
    .expecting ("the function body contains 'a > b'", (out) => out.body.indexOf ("a > b") > 0)

    .given ([{ a: 1, b: 2 }, { a: 3, b: 4, c: 5 }], "a > b", undefined)
    .returnsType (Function)
    .expecting ("the function takes 3 parameters", (out) => out.length == 3)

    .given ([{ a: 1, b: 2 }, { a: 3, b: 4, c: 5 }], "a > b", ["$a", "$b"])
    .returnsType (Function)
    .expecting ("the function takes 5 parameters", (out) => out.length == 5)
    .expecting ("the parameter names are $a, $b, a, b, and c", (out) => (out + "").replace (/\n/g, "").indexOf ("($a,$b,a,b,c)") > 0)

    .given ([{ a: 4, b: 2 }], "this.a > this.b", [])
    .returnsType (Function)
    .expecting ("func.invoke () to use the first argument as `this`", (func) => func.invoke ({ a: 4, b: 2}))
    .expecting ("func.invoke () to use provided `this` if called via apply ()", (func) => func.invoke.call ({ a: 1, b: 2 }, [{ a: 4, b: 2}]) === false)

    .given ([{ a: 1, b: 2 }, { a: 3, b: 4, c: 5 }], "a >/ b", [])
    .throws (/Invalid expression/)
;
