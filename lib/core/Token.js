const { toEnum } = require ("../utils");


class Token
{
    constructor (type, value, line, col, quoted, file)
    {
        this.type   = type;
        this.value  = value;
        this.line   = line;
        this.col    = col;
        this.quoted = quoted;
        this.file   = file;
        this.owner  = "";
    }

    toString ()
    {
        return `Token: { value: "${this.value}", line: ${this.line}, col: ${this.col}${this.file ? `, file: ${this.file}` : ""} }`;
    }
}

Token.TYPE  = toEnum (
    "COMMA",
    "ASSIGN",
    "OPEN_CURLY",
    "CLOSE_CURLY",
    "OPEN_SQUARE",
    "CLOSE_SQUARE",
    "VALUE",
    "NEWLINE",
    "WHITESPACE",
    "SUBSTITUTION",
    "COMMENT",
    "AT",
    "PIPE"
);


module.exports = { Token };
