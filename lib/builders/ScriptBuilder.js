const { Token }           = require ("../core/Token");
const { BuilderAdapter }  = require ("../core/BuilderAdapter");
const { ContentNode }     = require ("../nodes/ContentNode");

const no_path   = require ("path");
const no_vm     = require ("vm");
const no_module = require ("module");
const _         = require ("../utils");



class ScriptBuilder extends BuilderAdapter
{
    async build (text)
    {
        let object;

        let url = (this.context.url || "") + "";

        try
        {
            object = await this.runScript (text, url);
        }
        catch (e)
        {
            return;
        }

        if (typeof object == "object" && !_.propertyNames (object).length)
        {
            return;
        }

        let token = new Token (Token.TYPE.VALUE, object, 1, 1, true, url);

        this.context.createNode (ContentNode).append (token);
    }


    async runScript (script, url)
    {
        var func  = no_vm[this.$.vmContext == "this" ? "runInThisContext" : "runInNewContext"] (no_module.wrap (script), { filename: url });
        var mod   = { exports: {} };

        func (mod.exports, require, mod, url, no_path.dirname (url));

        return mod.exports;
    }
}


ScriptBuilder.defaults =
{
    ...BuilderAdapter.defaults,

    vmContext:  "this" // this or new
};


module.exports  = { ScriptBuilder };
