var licenses  = require ("../resources/popular-licenses");
var data      = { this: { is: { a: "path" } }, undef: undefined, null: null };


test.func (_, "query")
    .should ("accept a dot-separated path")
    .given (data, "this.is.a")
    .returns ("path")

    .given (data, "undef")
    .returns (undefined)

    .given (data, "null")
    .returns (null)

    .should ("be able to query a function's property")
    .given (test, "func")
    .returnsType ("function")

    .should ("return `undefined` if the object is `null` or `undefined`")
    .given (null, "prop")
    .returns (undefined)

    .given (undefined, "prop")
    .returns (undefined)
;


test.func (_.query, "query 'tests/resources/popular-licenses.json'")
    .should ("be able to apply the expression %1:j: Result: %2:j")

    .given (licenses, "*{other_names}.*{note}.0")
    .returns ("Because MIT has used many licenses for software, the Free Software Foundation considers MIT License ambiguous. The MIT License published on the OSI site is the same as the Expat License.")

    .given (licenses, "*{id}")
    .returns (expect.toBeInstanceOf (Array))
    .having ("length = 11", "length", 11)

    .given (licenses, "{id}.not_a_property")
    .returns (undefined)

    .given (licenses, "{id}.length")
    .given (licenses, "*{id}.length")
    .returns (11)

    .given (licenses, "*{id}.*{$.length}.length")
    .returns (11)

    .given (licenses, "*{id}.0")
    .returns ("Apache-2.0")

    .given (licenses, ".*{id}.0.")
    .returns ("Apache-2.0")

    .given (licenses, " . *{id} . 0 . ")
    .returns ("Apache-2.0")

    .given (licenses, "*{other_names}.{note}.length")
    .returns (2)

    .given (licenses, "*{other_names}.{note}.length".split ("."))
    .returns (2)

    .should ("throw if the filter expression is invalid")
    .given (licenses, "*{other_names - }")
    .throws ()

    .should ("throw if the filter expression is invalid")
    .given (licenses, "*{other_names}}")
    .throws ()

    .should ("throw if the filter expression is invalid")
    .given (licenses, "*{{other_names}")
    .throws ()
;


test.func (_, "query")
    .should ("return %2:j when obj = %0:j, path = %1:j")

    .given ({ a: 3, b: { c: 4, d: 5 } }, "*{b}.{c == 3}")
    .returns ([])

    .given ({ a: 3, b: { c: 4, d: 5 } }, "*{b}.{c == 4}")
    .returns ([{ c: 4, d: 5 }])

    .given ({ a: 3, b: { c: 4, d: 5 } }, "*{this}.{b.c == 4}")
    .returns ([{ a: 3, b: { c: 4, d: 5 } }])

    .given ({ a: 3, b: { c: 4, d: 5 } }, "*{}.{b.c == 4}")
    .returns ([{ a: 3, b: { c: 4, d: 5 } }])

    .given ({ a: 3, b: { c: 4, d: 5 } }, "*{   }.{b.c == 4}")
    .returns ([{ a: 3, b: { c: 4, d: 5 } }])

    .given ({ a: 3, b: { c: 4, d: 5 } }, "*{.}.{b.c == 4}")
    .returns ([{ a: 3, b: { c: 4, d: 5 } }])

    .given ([1, 2], "*")
    .returns ([1, 2])

    .given ("str", "*")
    .returns (["str"])

    .given (3, "*")
    .returns ([3])

    .given (
    {
        a: { n: "aa", v: 2 },
        b: { n: "bb", v: 3 },
        c: { n: "cc", v: 9 }

    }, "*.{v >= 3}")
    .returns ([{ n: "bb", v: 3 }, { n: "cc", v: 9 }])

    .given ({ a: 3, b: { c: 4, d: 5 } }, "b.c")
    .returns (4)

    .given ({ a: 3, b: { c: 4, d: 5 } }, "b. c")
    .returns (4)

    .given ({ a: 3, b: { c: 4, d: 5 } }, "b. c.")
    .returns (4)

    .given ({ a: 3, b: { c: 4, d: 5 } }, "b. .c")
    .returns (4)

    .given ({ a: 3, b: { c: 4, d: 5 } }, ["b", "c"])
    .returns (4)

    .given ({ a: 3, b: { c: 4, d: 5 } }, "a.d")
    .returns (undefined)

    .given ({ a: 3, b: { c: 4, d: 5 } }, "b.{c > 4}")
    .returns (undefined)

    .given ({ a: 3, b: { c: 4, d: 5 } }, "b.{c == 4}")
    .returns ({ c: 4, d: 5 })

    .given ([{ a: 3 }, { a: 4 }, { a: 2, c: 5 }], "{a > 2}")
    .returns ([{ a: 3 }, { a: 4 }])

    .given ([{ a: 3 }, { a: 4 }, { a: 2, c: 5 }], "*{a > 2}}")
    .throws (/extra filter/i)

    .given ([{ a: 3 }, { a: 4 }, { a: 2, c: 5 }], "*{a > 2")
    .throws (/not closed/i)
;
