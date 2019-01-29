test.func (_.toEnum)
    .should ("return an object of symbols")
        .given ("red", "green", "blue")
        .returns (expect.toBeInstanceOf (Object))
            .having ("property 'red' to be a symbol", "red", expect.toBeInstanceOf (Symbol))
            .having ("property 'green' to be a symbol", "green", expect.toBeInstanceOf (Symbol))
            .having ("property 'blue' to be a symbol", "blue", expect.toBeInstanceOf (Symbol))
            .having ("property 'blue' whose string representation is 'Symbol(blue)'", (v) => v.blue.toString (), "Symbol(blue)")
;
