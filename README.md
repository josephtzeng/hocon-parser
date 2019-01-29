# A HOCON Parser for Node.js

[![Node version](https://img.shields.io/node/v/@pushcorn/hocon-parser.svg?style=flat)](http://nodejs.org/download/)
[![Build Status](https://travis-ci.com/josephtzeng/hocon-parser.svg?branch=master)](https://travis-ci.com/josephtzeng/hocon-parser)
[![Coverage Status](https://coveralls.io/repos/github/josephtzeng/hocon-parser/badge.svg?branch=master)](https://coveralls.io/github/josephtzeng/hocon-parser?branch=master)
[![install size](https://packagephobia.now.sh/badge?p=@pushcorn/hocon-parser)](https://packagephobia.now.sh/result?p=@pushcorn/hocon-parser)
[![Known Vulnerabilities](https://snyk.io/test/github/josephtzeng/hocon-parser/badge.svg)](https://snyk.io/test/github/josephtzeng/hocon-parser)
[![Dependency Status](https://img.shields.io/david/josephtzeng/hocon-parser.svg)](https://david-dm.org/josephtzeng/hocon-parser)
[![devDependency Status](https://img.shields.io/david/dev/josephtzeng/hocon-parser.svg)](https://david-dm.org/josephtzeng/hocon-parser?type=dev)



**hocon-parser** is a lightweight and extensible JavaScript parser for [HOCON (Human-Optimized Config Object Notation)](https://github.com/lightbend/config/blob/master/HOCON.md). It can be used as a library or invoked via the CLI. It also supports data transformation (with a pipe "|" symbol) that allows you to transform the data into different types. Developer are free to extend core classes to achieve different parsing behavior.



## Installation

To use hocon-parser as library, go to your project directory and run the following command:

```sh
$ npm install @pushcorn/hocon-parser
```

The parser also comes with a CLI command ``parse-hocon``. Run the following command to install the parser globally:

```sh
$ npm install -g @pushcorn/hocon-parser
```

To parse a config file named ``test.conf``, just use the following command:

```sh
$ parse-hocon test.conf
```

You can also pass the config text to the program with the ``-t`` switch:

```sh
$ parse-hocon -t "a: 1"
```

The output of the command is a formatted JSON object:

```json
{
  "a": 1
}
```

*More documentation to come...*


## License

@pushcorn/hocon-parser is released under the ISC license.

ISC License (ISC)
Copyright © 2019 Joseph Tzeng

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
