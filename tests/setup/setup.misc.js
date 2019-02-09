const { TestFunc }    = require ("./core/TestFunc");
const { TestFeature } = require ("./core/TestFeature");
const no_util         = require ("util");


test.trackBranches.testMode = true;
test.trackBranches.suffix   = `-${process.pid}`;

console.log = function () {}; // eslint-disable-line no-console


test.func (test.trackBranches)
    .should ("create entries for dash-separated arguments")
    .given (true, true)
    .given (true, false)
    .returns ()
    .expecting ("branches variable to contain 'true-true'", () => "true-true" in test.trackBranches.branches)
;


test.func (test.trackBranches)
    .should ("create entries for dash-separated arguments")
    .given (true, true)
    .given (true, false)
    .returns ()
    .expecting ("branches variable to contain 'true-true'", () => "true-true" in test.trackBranches.branches);


function myTest ()
{
    return true;
}


test.func (test.func.only, "test.func.only")
    .should ("return the test function with the ONLY flag set")
    .given (myTest)
    .returns (expect.toBeInstanceOf (TestFunc))
    .expecting ("result[ONLY] = true", (tf) => !!~no_util.format (tf).indexOf ("[Symbol(ONLY)]: true"))
;


test.func (test.feature.only, "test.feature.only")
    .should ("return the test function with the ONLY flag set")
    .given ("test a new feature")
    .returns (expect.toBeInstanceOf (TestFeature))
    .expecting ("result[ONLY] = true", (tf) => !!~no_util.format (tf).indexOf ("[Symbol(ONLY)]: true"))
;
