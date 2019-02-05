var licenses  = require ("../resources/popular-licenses");
var data      = { this: { is: { a: "path" } }, undef: undefined, null: null };


test.func (_.query)
    .should ("accept a dot-separted path")
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
    .given (undefined, "prop")
    .returns (undefined)
;


test.func (_.query, "query 'tests/resources/popular-licenses.json'")
    .should ("be able to apply the expression %1:j: Result: %2:j")
    .given (licenses, "*{id}")
    .returns (expect.toBeInstanceOf (Array))
    .having ("length = %1:j", "length", 11)

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

    .given (licenses, "*{other_names}.*{note}.0")
    .returns ("Because MIT has used many licenses for software, the Free Software Foundation considers MIT License ambiguous. The MIT License published on the OSI site is the same as the Expat License.")

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
