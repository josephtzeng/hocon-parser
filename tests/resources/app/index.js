const parser = require ("../../../lib/parser");

parser.parse ({ text: "a: 1" })
    .then ((o) => console.log (JSON.stringify (o))); // eslint-disable-line no-console
