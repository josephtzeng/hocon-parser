test.trackBranches.suffix   = `-${process.pid}`;

const no_fs   = require ("fs");
const no_path = require ("path");
const no_os   = require ("os");


test.func (test.trackBranches)
    .should ("create entries for dash-separated arguments")
    .given (true, true)
    .given (true, false)
    .returns ()
    .expecting ("branches variable to contain 'true-true'", () => "true-true" in test.trackBranches.branches)
    .expecting ("it to write the branches to the file $TMPDIR/BRANCHES" + test.trackBranches.suffix, () => no_fs.existsSync (no_path.join (no_os.tmpdir (), `BRANCHES-${process.pid}`)))
;


