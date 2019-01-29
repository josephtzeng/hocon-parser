process.env.DEBUG = "TestFunc:*,A:*";


class A
{
    method ()
    {
        _.debug (this, "From A.method()", this);
    }
}

var a = new A;


function b ()
{
    _.debug ("func-b", "From b()");

    a.method ();

    return true;
}

/* eslint-disable multiline-comment-style */
/*
[
    [ '  \u001b[38;5;76;1mTestFunc:b [12:7] \u001b[0mFrom b()', '\u001b[38;5;76m+0ms\u001b[0m' ],
    [ '  \u001b[38;5;163;1mA:method [5:11] \u001b[0mFrom A.method()', '\u001b[38;5;163m+0ms\u001b[0m' ]
]
*/

var messages  = [];


test.func (b, "debug")
    .should ("show debug messages")
    .before (() =>
    {
        process.env.DEBUG_MODULE = "debug";

        var vm_debug = require ("debug");

        vm_debug.log = function (...args)
        {
            messages.push (args);
        };
    })
    .returns (true)
    .expecting ("message to contain 'TestFunc:b'", function ()
    {
        return !!~messages[0][0].indexOf ("TestFunc:b");
    })
    .expecting ("message to contain 'A:method' and 'A {}'", function ()
    {
        return !!~messages[1][0].indexOf ("A:method")
            && !!~messages[1][1].indexOf ("A {}");
    })
;

test.func (_.debug)
    .should ("reuse the mapped tag")
    .given (a, "From A.method()")
    .returns (["From A.method()"])
;

test.func (_.debug)
    .should ("ignore the caller when debug module is not available")
    .given (this, "hello")
    .before (() =>
    {
        process.env.DEBUG_MODULE = "custom-debug";
    })
    .after (() =>
    {
        delete process.env.DEBUG_MODULE;
    })
    .returns (["hello"])
;


test.func (_.debug)
    .should ("ignore the caller when debug module is not available")
    .given (this, "hello")
    .before (() =>
    {
        _.debug.module = null;
        process.env.DEBUG_MODULE = "custom-debug";
    })
    .after (() =>
    {
        delete process.env.DEBUG_MODULE;
    })
    .returns (["hello"]);


test.func (_.debug)
    .should ("use the default 'debug' module")
    .given (this, "hello")
    .before (() =>
    {
        _.debug.module = null;
    })
    .returns (["hello"]);

