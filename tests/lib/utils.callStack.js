test.func (_.callStack)

    .should ("return an array of CallSites")
        .returns (expect.toBeInstanceOf (Array))
        .having ("size greater than 2", "length", expect.toBeGreaterThan (3))
        .having ("every element to be an object", expect.every (expect.toBeInstanceOf (Object)))
        .having ("every element to be an instance of CallSite", expect.every (expect.toBeInstanceOf ("CallSite")))
;
