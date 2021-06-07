const ONLY = Symbol ("ONLY");



class TestFunc
{
    constructor (func, name)
    {
        var type = "Function";

        if (!func)
        {
            throw new Error ("The parameter func cannot be empty.");
        }

        if (typeof func == "object" || name in func)
        {
            type  = "Method";

            let n = name;
            let c = func.constructor.name;


            if (typeof n == "function")
            {
                name = n.name;
            }

            this.object = func;

            func = func[name].bind (func);
            name = c + "." + name + " ()";
        }

        this.func     = func;
        this.name     = `${type}: ` + (name || func.name);
        this.givens   = [];
        this.befores  = [];
        this.afters   = [];
        this.message  = "";
    }


    get only ()
    {
        this[ONLY] = true;

        return this;
    }


    should (message)
    {
        this.message = "should " + message;

        return this;
    }


    can (message)
    {
        this.message = "can " + message;

        return this;
    }


    before (func)
    {
        this.befores.push (func);

        return this;
    }


    after (func)
    {
        this.afters.push (func);

        return this;
    }


    given (...args)
    {
        this.givens.push (args);

        return this;
    }

    or ()
    {
        return this.given (...arguments);
    }


    satisfies (checker)
    {
        this.run (async function ()
        {
            var out = this.output = await this.func (...arguments);
            var v   = await checker (out);

            expect (v).not.toEqual (false);
        });

        return this;
    }


    returnsType (type)
    {
        this.run (async function (...args)
        {
            var out = this.output = await this.func (...args);

            this.args = args;

            if (typeof type  == "function")
            {
                expect (out instanceof type).toBe (true);
            }
            else
            {
                expect (typeof out == type).toBe (true);
            }
        });

        return this;
    }


    returns (result)
    {
        this.result = result;

        this.run (async function (...args)
        {
            var out = this.output = await this.func (...args);

            this.args = args;

            if (typeof result == "function")
            {
                this.result = result = await result ();
            }

            if (typeof result == "function" || typeof result == "object")
            {
                expect (out).toEqual (result);
            }
            else
            {
                expect (out).toBe (result);
            }
        });

        return this;
    }


    expecting (message, checker)
    {
        (this[ONLY] ? describe.only : describe) (this.name, () =>
        {
            it ("  +--> expecting " + message, () =>
            {
                // received, expected
                var v = checker (this.output, this.result, this);

                expect (v).not.toEqual (false);
            });
        });

        return this;
    }


    having (message, prop, predicate)
    {
        if (arguments.length == 2 && typeof prop != "function")
        {
            predicate = prop;
            prop      = undefined;
        }

        (this[ONLY] ? describe.only : describe) (this.name, () =>
        {
            it ("  +--> having " + message, () =>
            {
                var v = this.output;

                if (typeof prop == "function")
                {
                    v = prop (this.output);
                }
                else
                if (prop !== undefined)
                {
                    v = _.query (v, prop);
                }

                expect (v).toEqual (predicate);
            });
        });

        return this;
    }


    throws (message)
    {
        return this.run (async function ()
        {
            let v;

            try
            {
                v = await this.func (...arguments);
            }
            catch (e)
            {
                v = e;
            }

            if (message)
            {
                if (message instanceof RegExp)
                {
                    expect (v.message || "").toMatch (message);
                }
                else
                {
                    expect (v.message || "").toBe (message);
                }
            }
            else
            if (v != null && typeof v == "object")
            {
                expect (v.constructor.name).toContain ("Error");
            }
            else
            {
                expect (v).toBeInstanceOf (Error);
            }
        });
    }


    run (callback)
    {
        if (!this.givens.length)
        {
            this.givens.push ([]);
        }

        let { name, message, givens, befores, afters, result } = this;

        (this[ONLY] ? describe.only : describe) (name, () =>
        {
            for (let args of givens)
            {
                it (test.formatString (message, args.concat ([result])), async () =>
                {
                    let res;

                    for (let b of befores)
                    {
                        await b ();
                    }

                    try
                    {
                        res = await callback.apply (this, args);
                    }
                    finally
                    {
                        for (let a of afters)
                        {
                            await a ();
                        }
                    }

                    return res;
                });
            }
        });

        this.givens   = [];
        this.befores  = [];
        this.afters   = [];

        return this;
    }
}


module.exports = { TestFunc };
