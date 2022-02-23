# A HOCON Parser for Node.js

[![Node version](https://img.shields.io/node/v/@pushcorn/hocon-parser.svg?style=flat)](http://nodejs.org/download/)
[![Build Status](https://travis-ci.com/josephtzeng/hocon-parser.svg?branch=master)](https://travis-ci.com/josephtzeng/hocon-parser)
[![Coverage Status](https://coveralls.io/repos/github/josephtzeng/hocon-parser/badge.svg?branch=master)](https://coveralls.io/github/josephtzeng/hocon-parser?branch=master)
[![install size](https://packagephobia.now.sh/badge?p=@pushcorn/hocon-parser)](https://packagephobia.now.sh/result?p=@pushcorn/hocon-parser)
[![Known Vulnerabilities](https://snyk.io/test/github/josephtzeng/hocon-parser/badge.svg)](https://snyk.io/test/github/josephtzeng/hocon-parser)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/josephtzeng/hocon-parser.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/josephtzeng/hocon-parser/context:javascript)

**hocon-parser** is a lightweight and extensible JavaScript parser for
[HOCON (Human-Optimized Config Object Notation)](https://github.com/lightbend/config/blob/master/HOCON.md).
It can be used as a library or invoked via the CLI. It also supports data
transformation (with a pipe "|" symbol) that allows you to transform the data
into different types. Developer are free to extend core classes to achieve
different parsing behavior.

## Table of Contents

<!-- vim-markdown-toc GFM -->

* [Installation](#installation)
* [Examples](#examples)
  * [Array Element Accessing](#array-element-accessing)
  * [Dynamic Include](#dynamic-include)
  * [Filter Transform](#filter-transform)
  * [Array Inclusion](#array-inclusion)
  * [Key Substitution](#key-substitution)
  * [Resolution with Local Scope](#resolution-with-local-scope)
  * [Nested Substitution](#nested-substitution)
* [Divergence from the HOCON Spec](#divergence-from-the-hocon-spec)
* [Parsing Modes](#parsing-modes)
  * [Default Mode](#default-mode)
    * [File Inclusion Shorthand](#file-inclusion-shorthand)
    * [Data Transformation](#data-transformation)
    * [Properties File Parsing](#properties-file-parsing)
    * [Number Parsing](#number-parsing)
  * [Strict Mode](#strict-mode)
* [Core Components](#core-components)
  * [Context](#context)
  * [Node](#node)
  * [Source](#source)
  * [Builder](#builder)
  * [Transform](#transform)
* [License](#license)

<!-- vim-markdown-toc -->

## Installation

To use hocon-parser as library, go to your project directory and run the
following command:

```sh
npm install @pushcorn/hocon-parser
```

The parser also comes with a CLI command `parse-hocon`. Run the following
command to install the parser globally:

```sh
npm install -g @pushcorn/hocon-parser
```

To parse a config file named `test.conf`, just use the following command:

```sh
parse-hocon test.conf
```

You can also pass the config text to the program with the `-t` switch:

```sh
parse-hocon -t "a: 1"
```

The output of the command is a formatted JSON object:

```json
{
  "a": 1
}
```

## Examples

A lot of examples can be found in the
[tests/resources/configs](https://github.com/josephtzeng/hocon-parser/tree/master/tests/resources/configs)
directory. Each subdirectory should contain a file `test.conf` and optionally
a result file `result.json`. If a directory name contains the `.error` suffix,
that means parsing the test file `test.conf` will result in an error. By
default, the files are parsed in strict mode when testing. If the directory name
has a `.default` suffix, the config file will be parsed in the default mode.
Below is a list of some advanced features that the parser supports.

### Array Element Accessing

Input:

```hocon
b = [${f}]
f = { nested: { g: 9 } }
this_is_9_from_b_0 = ${b.0.nested.g}
```

Output:

```json
{
  "b": [
    {
      "nested": {
        "g": 9
      }
    }
  ],
  "f": {
    "nested": {
      "g": 9
    }
  },
  "this_is_9_from_b_0": 9
}
```

### Dynamic Include

Input:

```hocon
env = development

config {
    include ${env}
}
```

`development.conf`:

```hocon
name: orange
os: linux
```

Output:

```json
{
  "config": {
    "name": "orange",
    "os": "linux"
  },
  "env": "development"
}
```

### Filter Transform

Input:

```hocon
a: [1, 2, 3, 4, 5, 6] | filter { expr = "$ > 3" }
```

Output:

```json
{
  "a": [
    4,
    5,
    6
  ]
}
```

### Array Inclusion

Input:

```hocon
a: 3
b: include array
```

`array.json`

```json
[1, 2]
```

Output:

```json
{
  "a": 3,
  "b": [
    1,
    2
  ]
}
```

### Key Substitution

Input:

```hocon
a = x
b = y
${a}.${b} = 33
```

Output:

```json
{
  "a": "x",
  "b": "y",
  "x": {
    "y": 33
  }
}
```

### Resolution with Local Scope

Input:

```hocon
hello_david {
  name = "david"
  include "hello.conf"
}

hello_lisa {
  name = "lisa"
  include "hello.conf"
}
```

`hello.conf`:

```hocon
hello {
  msg = hello ${name}
}
```

Output:

```json
{
  "hello_david": {
    "hello": {
      "msg": "hello david"
    },
    "name": "david"
  },
  "hello_lisa": {
    "hello": {
      "msg": "hello lisa"
    },
    "name": "lisa"
  }
}
```

### Nested Substitution

Input:

```hocon
region : 2

regions {
    1 : us-east-1
    2 : eu-west-1
    3 : sa-east-1
}

name : ${regions.${region}}
```

Output:

```json
{
  "name": "eu-west-1",
  "region": 2,
  "regions": {
    "1": "us-east-1",
    "2": "eu-west-1",
    "3": "sa-east-1"
  }
}
```

## Divergence from the HOCON Spec

HOCON is a simple yet powerful configuration language. To make it more powerful,
this parser supports an extended inclusion syntax that allows the user to
specify how a resource will be included. For example, the following two snippets
means the same thing: include `/test.conf` from `localhost` and parse the config
in the strict mode.

Syntax 1:

```hocon
include { url = "http://localhost/test.conf", strict: true }
```

Syntax 2:

```hocon
include strict(url("http://localhost/test.conf"))
```

The parser also supports file inclusion at the property level. For example,
following snippet can be used to load your server certificates. The parser will
check the file extension and choose a proper node builder to parse the content.
In this case, both `.key` and `.crt` are not known binary extensions, so the
parser will load the files in plain text and `keys.private` and `keys.public`
will both contain a string.

```hocon
keys {
  private = include host.key
  public = include host.crt
}
```

To prevent the parser from treating `include` as a keyword, simple surround the
keyword with double quotes.

```hocon
private = "include" host.key
```

In addition to the `include` keyword, you can also use `require` to **require**
a file. Basically,

```hocon
include required ("test.conf")
```

is the same as

```hocon
require "test.conf"
```

Another divergence from the spec is that defining an array at root level is
allowed. For example, given the following two files

array.conf:

```hocon
[1, 2, 3]
```

main.conf:

```hocon
ints: include array.conf
```

The output of `parse-hocon main.conf` will be

```json
{
  "ints": [
    1,
    2,
    3
  ]
}
```

## Parsing Modes

The parser can operate in two modes: default or strict. In the default mode, the
parser supports the file inclusion symbol, data transformation, and will try to
convert a string value into a JS primitive value when possible. In the strict
mode, the parser is **more** spec-compliant, and some extended syntaxes are not
available.

### Default Mode

#### File Inclusion Shorthand

Instead of using the `include` keyword, you can use `@?` and `@` to **include**
or **require** a file, respectively.

```hocon
@"file.conf" # the same as "include required (file.conf)" or "require file.conf"
@?"file.conf" # the same as "include file.conf"
```

#### Data Transformation

You can use transforms to quickly map filter an array or turn a value into a
different type. To apply a transform, simply put a pipe (`|`) character followed
by the name of the transform you want to use. You can pass an option object to
the transform if it is configurable. Applying multiple transforms to a value is
also supported. For example, the following snippet will sort the array then
extract the last 2 elements from it.

```hocon
a: [3, 4, 5, 1, 2] | sort | slice { end = -2 }
```

Output:

```json
{
  "a": [
    4,
    5
  ]
}
```

Besides the `sort` and `slice` transforms, the parser comes with several useful
transforms like `map`, `reduce`, `query`, and `eval`. You can also define your
transforms and register them with the `parser.registerComponent ()` method.

#### Properties File Parsing

According to the spec, the values from a `.properties` file are always
interpreted as strings. In the default mode, the parser will try to convert them
into corresponding JS values.

#### Number Parsing

The spec did not clearly define how an unquoted string `.3` is parsed. Some
implementations treat it as a string because floats with a leading dot is not
allowed by JSON. This parser will interpret it as `0.3` by default.

### Strict Mode

The strict mode can be enabled in several ways. When using the CLI, just pass
the `-s` switch to the command.

```sh
$ parse-hocon -t "a: .3" -s
{
  "a": ".3"
}
```

Or just set the `strict` option to `true` when using the parser programmatically.

```js
const parse = require ("@pushcorn/hocon-parser");

parse ({ text: "a: .3", strict: true }).then (console.log);
```

Or wrap the file path with `strict()` when you include a file.

```hocon
include strict(file("test.properties"))
```

## Core Components

The parser consists of five major components:

* Context: The parsing context.
* Node: The data structure used to represent the parsed config.
* Source: The data source.
* Builder: The node builder.
* Transform: The data transform.

### Context

The context is responsible for loading the data from the source and building the
root node of the config file. A new context will be created when a file is
included. A context also stores some relevant information about the loaded
file/resource, like encoding of the file, whether the file is required, or if
the file should be parsed in strict mode. The Context class does the heavy
lifting of the parsing task. If you check the source code, you will notice that
the parser simply delegates the parsing task to the context.

```js
var context = new Context (opts);
var result  = await context.resolve ();
```

### Node

The parser comes with several node classes that are used to represent the data
defined in the config file. For example, the `ArrayNode` represents an array and
the `ObjectNode` represents an object. The context holds a reference to the root
node of the config, and that root node will be used as the starting point for
the resolving phase of the parsing process. Developers are free to extend the
existing node classes. For example, if you want to extend `ObjectNode`, first
create a class that extends `ObjectNode`, then register it with
`parser.registerNode ()` or `Node.registerNode ()` method. For example, running
the following snippet

```js
const parser = require ("@pushcorn/hocon-parser");
const ObjectNode = parser.getClass ("nodes.ObjectNode");

class MyObjectNode extends ObjectNode
{
    constructor (parent, context)
    {
        super (parent, context);

        console.log ("MyObjectNode created!");
    }
}

parser.registerNode (MyObjectNode);

parser.parse ({ text: "a: 1" })
    .then (console.log)
    .catch (console.error);
```

should give you the following output.

```sh
MyObjectNode created!
{ a: 1 }
```

### Source

A source is responsible for loading the resource data from a specified location.
A resource could be a file on the local disk, a file hosted on a remote server,
or the data stored in a database. When a context is initialized, it will check
the specified URL and try to determine the protocol of the URL. For example, if
the URL is `/test.conf`, the context will turn it into `file:///test.conf`. If
the URL is `test.conf`, then it will be resolved to `file://<CWD>/test.conf`
where `<CWD>` is the absolute path of the current working directory. The parser
supports the following protocols by default:

| Protocol    | Source Class     | Loading Data from... |
|-------------|------------------|----------------------|
| context:    | ContextSource    | Context.text |
| file:       | FileSource       | a local file at the given path |
| http:       | HttpSource       | a remote file at the given URL with the http: protocol |
| https:      | HttpsSource      | a remote file at the given URL with the https: protocol |
| modulepath: | ModulepathSource | a local file that can be found under the module search paths (`module.paths`) |

You can define your own source, but the name of the class should be in the
format of `<Protocol>Source` and it should extend `SourceAdapter`.

```js
const { SourceAdapter, registerComponent } = require ("@pushcorn/hocon-parser");

class TestSource extends SourceAdapter
{
    async onLoad ()
    {
        // load and return the data
    }
}

registerComponent (TestSource);
```

Once the source is registered, the context will use the source to load the data
when the URL is `test://...`.

### Builder

A builder is responsible for building the root node for the context. When the
`resolve` method of `Context` is called, it will ask the root node to perform
the resolution by calling `Node.resolve ()`. The context will try to find the
proper builder to build the root node. For example, if the file extension is
`.conf` or `.json`, it will use the `ConfigBuilder`. If the data source returns
a `Buffer` or a JavaScript object, then it will use the `ContentBuilder`, which
will return the buffer or the object when the node resolves. If the file
extension is `.js`, then it will choose `ScriptBuilder`, which will evaluate the
loaded script in the new or current (or `this`) context.

To define your own builder, simply extend `BuilderAdapter` and implement the
`build` method. Remember to call `this.context.createNode ()` to create the root
node.

```js
const { BuilderAdapter, registerComponent } = require ("@pushcorn/hocon-parser");

class TestBuilder extends BuilderAdapter
{
    async build (data)
    {
        ...
        this.context.createNode (<NodeClass>)
    }
}

registerComponent (TestBuilder);
```

### Transform

As the name suggests, a transform is used to convert or post-process the loaded
data or value. Below is an example of using the `HashTransform` to get the md5
checksum of an image file.

```hocon
image-hash = @image.png | hash { algorithm = md5 }
```

If an input value is not provided, an empty string will be used as the input. To
get the md5 hash of the empty string, you could use the following config.

```hocon
empty-string-hash = | hash { algorithm = md5 }
```

To define your own transform is very easy too. You just need to extend the
`TransformAdapter` class and implement the `onApply` method. If your transform
takes any option, simply add a `defaults` property to the transform class.

```js
const { TransformAdapter, registerComponent } = require ("@pushcorn/hocon-parser");

class TestTransform extends TransformAdapter
{
    async onApply (resolution)
    {
        // Do something with the resolution and return the result.
        // To get the value of opt1, use "this.$.opt1".
    }
}

TestTransform.defaults =
{
    opt1: <default_value_1>,
    opt2: <default_value_2>
};


registerComponent (TestTransform);
```

## License

@pushcorn/hocon-parser is released under the ISC license.

ISC License (ISC)
Copyright © 2019 Joseph Tzeng

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
