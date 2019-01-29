const no_os   = require ("os");
const no_fs   = require ("fs");
const no_path = require ("path");

const tmp     = no_os.tmpdir();
const dir     = no_fs.mkdtempSync (no_path.join (tmp, "pushcorn-"));
const dname   = no_path.basename (dir);
const ndir    = no_fs.mkdtempSync (no_path.join (dir, "subdir-"));
const nname   = no_path.basename (ndir);
const file1   = no_path.join (dir, "test1");
const file2   = no_path.join (dir, "test2");
const mesg1   = "this is an async test";
const mesg2   = "this is a sync test";

var wrote1;
var wrote2;


test.func (_.writeFile)
    .should ("write to a test file")
    .given (file1, mesg1)
    .returns (async () =>
    {
        wrote1 = await _.readFile (file1);
    })
    .expecting (`the file content to be '${mesg1}'`, () => mesg1 === wrote1)
;


test.func (_.writeFile)
    .should ("throw when writing to a directory")
    .given (dir, mesg1)
    .throws ()
;


test.func (_.writeFileSync)
    .should ("write to a test file")
    .given (file2, mesg2)
    .returns (() =>
    {
        wrote2 = _.readFileSync (file2);
    })
    .expecting (`the file content to be '${mesg2}'`, () => mesg2 === wrote2)
;


test.func (_.readDir)
    .should ("be able to list dirs")
    .given (tmp, _.readDir.TYPE.DIR)
    .returns (expect.toBeInstanceOf (Array))
    .expecting (`the result to contain '${dname}'`, (out) => !!~out.indexOf (dname))

;

test.func (_.readDirSync)
    .should ("be able to list dirs")
    .given (tmp, _.readDir.TYPE.DIR)
    .returns (expect.toBeInstanceOf (Array))
    .expecting (`the result to contain '${dname}'`, (out) => !!~out.indexOf (dname))

;


test.func (_.readDir)
    .should ("be able to list files")
    .given (dir, _.readDir.TYPE.FILE)
    .returns (expect.arrayContaining (["test1", "test2"]))
;


test.func (_.readDirSync)
    .should ("be able to list files")
    .given (dir, _.readDir.TYPE.FILE)
    .returns (expect.arrayContaining (["test1", "test2"]))
;


test.func (_.readDir)
    .should ("be able to list both dirs and files")
    .given (dir, _.readDir.TYPE.ALL)
    .returns (expect.arrayContaining (["test1", "test2", nname]))
;


test.func (_.readDirSync)
    .should ("be able to list both dirs and files if 'type' is not specified")
    .given (dir)
    .returns (expect.arrayContaining (["test1", "test2", nname]))
;


test.func (_.readDir)
    .should ("throw when trying to read non-existing dir")
    .given (dname, _.readDir.TYPE.ALL)
    .throws ()
;


test.func (_.readDirSync)
    .should ("throw when trying to read non-existing dir")
    .given (dname, _.readDirSync.TYPE.ALL)
    .throws ()
;

