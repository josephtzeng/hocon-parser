const { Token } = include ("lib/core/Token");


test.feature ("Token methods")
    .given (new Token (Token.TYPE.VALUE, "test", 3, 4, false))
    .expecting ("Token.toString () to skip file if not specified", (token) => !~(token + "").indexOf ("file"));
