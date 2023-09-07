const $$  = new WeakMap ();
const _   = require ("../utils");



// implement at least one load method
class SourceAdapter
{
    static get aliases ()
    {
        return [];
    }


    constructor (context, opts)
    {
        this.context = context;

        $$.set (this, _.options (this.constructor.defaults, opts));
    }


    get $ ()
    {
        return $$.get (this);
    }


    set data (v)
    {
        this.$.data = v;
    }


    get data ()
    {
        return this.$.data;
    }


    get preferredBuilder ()
    {
        return "";
    }


    get notFound ()
    {
        return SourceAdapter.NOT_FOUND;
    }


    async load () // eslint-disable-line no-unused-vars
    {
        if (this.hasCycle ())
        {
            throw new Error (`Including '${this.context.url}' from itself will create a cycle.`);
        }

        return (this.data = await this.onLoad ());
    }


    appendPath (path)
    {
        return path;
    }


    hasCycle ()
    {
        return false;
    }


    async onLoad ()
    {
    }
}


SourceAdapter.NOT_FOUND = Symbol ("NOT_FOUND");


module.exports  = { SourceAdapter };
