var no_crypto = require ("crypto");


module.exports  = new Promise (function (yes, no) // eslint-disable-line no-unused-vars
{
    setTimeout (function ()
    {
        yes (
        {
            number: Math.random (),
            random_bytes: no_crypto.randomBytes (16).toString ("hex")
        });

    }, 100);
});
