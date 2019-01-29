const $$  = new WeakMap ();
const _   = require ("../utils");


// Context's node builder
class BuilderAdapter
{
    constructor (context, opts)
    {
        this.context = context;

        $$.set (this, _.options (this.constructor.defaults, opts));
    }


    get $ ()
    {
        return $$.get (this);
    }


    async build (data) // eslint-disable-line no-unused-vars
    {
    }


    expandUrl (url) // eslint-disable-line no-unused-vars
    {
        return [];
    }
}



module.exports  = { BuilderAdapter };
