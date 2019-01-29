const ONLY = Symbol ("ONLY");



class TestFeature
{
    constructor (description)
    {
        this.desc     = description;
        this.context  = null;
    }


    get only ()
    {
        this[ONLY] = true;

        return this;
    }


    given (context)
    {
        this.context = context;

        return this;
    }

    expecting (message, checker, result)
    {
        var hasResult = arguments.length == 3;

        describe (this.description, () =>
        {
            it ("  +--> expecting " + message, async () =>
            {
                var v = await checker (this.context);

                if (hasResult)
                {
                    expect (v).toEqual (result);
                }
                else
                {
                    expect (v).not.toEqual (false);
                }
            });
        });

        return this;
    }

}


module.exports = { TestFeature };
