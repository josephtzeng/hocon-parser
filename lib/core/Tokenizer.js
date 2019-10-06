const { Token } = require ("./Token");


class Tokenizer
{
    constructor (file)
    {
        this.file = file || "";
    }


    tokenize (text, strict)
    {
        var WHITE_SPACE_PATTERN       = /[ \t\v]+/g;
        var UNQUOTED_DEFAULT_PATTERN  = /[^$"{}[\]:=,+#`^?!@|*&\\ \t\r\n]+/g;
        var UNQUOTED_STRICT_PATTERN   = /[^$"{}[\]:=,+#`^?!@*&\\ \t\r\n]+/g;
        var UNQUOTED_CHAR_PATTERN     = strict ? UNQUOTED_STRICT_PATTERN : UNQUOTED_DEFAULT_PATTERN;
        var QUOTED_CHAR_PATTERN       = /(\\.|[^"\r\n])*/g;
        var COMMENT_CHAR_PATTERN      = /[^\r\n]+/g;
        var TRIPLE_QUOTES_PATTERN     = /"{3,}/g;
        var EXPONENT_PATTERN          = /-?\d(\.\d*)?e\+\d/gi;


        var file    = this.file;
        var fileStr = file && `, file: ${file}`;
        var index   = 0;
        var len     = text.length;
        var tokens  = [];
        var token;

        var lineNum     = 1;
        var lineOffsets = [0];


        function getNextToken ()
        {
            if (index >= len)
            {
                return;
            }

            var value   = "";
            var ch      = text[index];
            var quoted  = false;
            var type,
                match;

            switch (ch)
            {
                case ":":
                    if (!strict && text[index + 1] == "=") // overwriting instead of merging
                    {
                        ch += "=";
                    }

                case "=": // eslint-disable-line no-fallthrough
                    type  = Token.TYPE.ASSIGN;
                    break;

                case " ":
                case "\t":
                    WHITE_SPACE_PATTERN.lastIndex = index;

                    match   = WHITE_SPACE_PATTERN.exec (text);
                    ch      = match[0];
                    type    = Token.TYPE.WHITESPACE;
                    break;

                case "\r":
                    if (text[index + 1] == "\n")
                    {
                        ch  += "\n";
                    }
                    // falls through

                case "\n":
                    type    = Token.TYPE.NEWLINE;
                    lineOffsets.push (index + ch.length);
                    lineNum++;
                    break;

                case "{":
                    type    = Token.TYPE.OPEN_CURLY;
                    break;

                case "}":
                    type    = Token.TYPE.CLOSE_CURLY;
                    break;

                case "[":
                    type    = Token.TYPE.OPEN_SQUARE;
                    break;

                case "]":
                    type    = Token.TYPE.CLOSE_SQUARE;
                    break;

                case "/":
                    if (text[index + 1] != "/")
                    {
                        break;
                    }
                    // falls through

                case "#":
                    COMMENT_CHAR_PATTERN.lastIndex = index;

                    match   = COMMENT_CHAR_PATTERN.exec (text);
                    ch      = match[0];
                    type    = Token.TYPE.COMMENT;
                    break;

                case "+":
                    if (text[index + 1] == "=")
                    {
                        ch    += "=";
                        type  = Token.TYPE.ASSIGN;
                    }
                    else
                    {
                        let prevText  = "";

                        for (let i = tokens.length - 1; i >= 0; --i)
                        {
                            let t = tokens[i];

                            if (t.type == Token.TYPE.VALUE)
                            {
                                prevText = t.value + prevText;
                            }
                            else
                            {
                                break;
                            }
                        }

                        let startIndex = index - prevText.length;

                        EXPONENT_PATTERN.lastIndex = startIndex;

                        if ((match = EXPONENT_PATTERN.exec (text)) && match.index == startIndex)
                        {
                            type  = Token.TYPE.VALUE;
                        }
                        else
                        {
                            throw new Error (`Plus sign should be quoted. (line: ${lineNum}, col: ${index + ch.length - lineOffsets[lineNum - 1]}${fileStr})`);
                        }
                    }
                    break;

                case '"':
                    if (text.slice (index, index + 3) == '"""')
                    {
                        TRIPLE_QUOTES_PATTERN.lastIndex = index + 3;

                        match   = TRIPLE_QUOTES_PATTERN.exec (text);

                        if (!match)
                        {
                            throw new Error (`Multi-line string is not closed! (line: ${lineNum}, col: ${index + 1 + ch.length - lineOffsets[lineNum - 1] + 1}${fileStr})`);
                        }

                        ch      = text.slice (index + 3, match.index + match[0].length - 3);

                        index   += 6;
                        quoted  = 3;

                        let idx = index;

                        for (let line of ch.split (/\r?\n/).slice (0, -1))
                        {
                            lineNum++;
                            idx += line.length;

                            lineOffsets.push (idx);
                        }
                    }
                    else
                    {
                        QUOTED_CHAR_PATTERN.lastIndex = index + 1;
                        match   = QUOTED_CHAR_PATTERN.exec (text);
                        ch      = match && match[0] || "";

                        var nch = text[index + 1 + ch.length];

                        if (nch != '"')
                        {
                            throw new Error (`Quoted string not closed! (text: '${nch === undefined ? "" : nch}', line: ${lineNum}, col: ${index + 1 + ch.length - lineOffsets[lineNum - 1] + 1}${fileStr})`);
                        }

                        index   += 2;
                        quoted  = 1;
                    }

                    type    = Token.TYPE.VALUE;
                    break;

                case ",":
                    type = Token.TYPE.COMMA;
                    break;

                case "@":
                    if (!strict)
                    {
                        if (text[index + 1] == "?")
                        {
                            ch += "?";
                        }

                        type  = Token.TYPE.AT;
                    }
                    break;

                case "|":
                    type  = Token.TYPE.PIPE;
                    break;

                case "$":
                    if (text[index + 1] == "{")
                    {
                        ch += "{";

                        if (text[index + 2] == "?")
                        {
                            ch += "?";
                        }

                        type  = Token.TYPE.SUBSTITUTION;

                        break;
                    }
            }

            if (!type)
            {
                UNQUOTED_CHAR_PATTERN.lastIndex = index;

                if (!(match = UNQUOTED_CHAR_PATTERN.exec (text)) || match.index != index)
                {
                    let str = text.slice (index, index + 9);

                    throw new Error (`Unexpected character '${ch}' in an unqouted string '${str}${str.length > 5 ? "..." : ""}'. (line: ${lineNum}, col: ${index + 1 - lineOffsets[lineNum - 1]}${fileStr})`);
                }

                ch      = match[0];
                type    = Token.TYPE.VALUE;
            }

            var chLen = ch.length;

            if (chLen)
            {
                value += ch;
                index += chLen;
            }

            var ln    = lineNum,
                col   = index - value.length - lineOffsets[ln - 1] + 1,
                val   = value;

            if (type == Token.TYPE.NEWLINE)
            {
                --ln;

                col = lineOffsets[ln] - lineOffsets[ln - 1] - val.length + 1;
                val = value.replace (/\r/g, "<CR>").replace (/\n/g, "<LF>");
            }
            else
            if (quoted === 1)
            {
                try
                {
                    val = Tokenizer.unescapeString (val);
                }
                catch (e)
                {
                    var token = new Token (type, e.match, ln, col - 1 + e.index, !!quoted, file);

                    throw new Error (`${e.message} ${token}`);
                }
            }

            return new Token (type, val, ln, col - (quoted || 0), !!quoted, file);
        }


        while ((token = getNextToken ()))
        {
            tokens.push (token);
        }

        return tokens;
    }
}


Tokenizer.ALLOWED_ESCAPE =
{
    "b":  "\b",
    "f":  "\f",
    "t":  "\t",
    "n":  "\n",
    "r":  "\r",
    '"':  '"',
    "'":  "'",
    "/":  "/",
    "\\": "\\"
};

Tokenizer.HEX_PATTERN           = /^[0-9a-f]{0,4}$/i;
Tokenizer.INVALID_CHAR_PATTERN  = /[\f\b\t]/g;


Tokenizer.unescapeString = function (str)
{
    var escaped = "";
    var chars   = [...str].map ((c, i) => ({ c, i }));
    var ch;

    while (chars.length && (ch = chars.shift ()))
    {
        let nch = chars[0] || {};
        let e;

        if (ch.c.match (Tokenizer.INVALID_CHAR_PATTERN))
        {
            e = new Error (`Unescaped character.`);

            e.index = ch.i;
            e.match = `${ch.c}`;

            throw e;
        }

        let cc = ch.c.charCodeAt (0);

        if (cc >= 0x0000 && cc <= 0x001F)
        {
            e = new Error (`Unescaped control character.`);

            e.index = ch.i;
            e.match = `0x${cc.toString (16)}`;

            throw e;
        }


        if (ch.c == "\\")
        {
            chars.shift ();

            if (nch.c in Tokenizer.ALLOWED_ESCAPE)
            {
                escaped += Tokenizer.ALLOWED_ESCAPE[nch.c];
            }
            else
            if (nch.c == "u")
            {
                let code  = chars.slice (0, 4)
                            .map (ch => ch.c)
                            .join ("");

                let match = code.match (Tokenizer.HEX_PATTERN);

                chars = chars.slice (4);

                if (!match || match[0].length != 4)
                {
                    e = new Error (`Invalid Unicode escape sequence.`);

                    e.index = ch.i;
                    e.match = `\\u${code}`;

                    throw e;
                }
                else
                {
                    escaped += String.fromCharCode (parseInt(code, 16));
                }
            }
            else
            {
                e = new Error (`Invalid escape sequence.`);

                e.index = ch.i;
                e.match = `\\${nch.c}`;

                throw e;
            }
        }
        else
        {
            escaped += ch.c;
        }
    }

    return escaped;

};


module.exports = { Tokenizer };
