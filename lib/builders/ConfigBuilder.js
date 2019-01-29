const { BuilderAdapter }  = require ("../core/BuilderAdapter");
const CONFIG_EXTENSIONS   = [".conf", ".json", ".properties"];


const no_path = require ("path");



class ConfigBuilder extends BuilderAdapter
{
    async build (data)
    {
        let { rootType, tokens } = this.tokenize (data);

        this.context.createNode (rootType).append (...tokens);
    }


    expandUrl (url)
    {
        var path  = url.path;
        var urls  = [];

        if (path && !no_path.extname (path))
        {
            for (let ext of CONFIG_EXTENSIONS)
            {
                let u = url.clone ();

                u.append (ext);

                urls.push (u + "");
            }
        }

        return urls;
    }



    tokenize (text)
    {
        var ctx       = this.context;
        var T         = Token.TYPE;
        var tokenizer = new Tokenizer (ctx.url && ctx.url.href);
        var tokens    = tokenizer.tokenize (text, ctx.strict);
        var rootType  = ObjectNode;

        for (let token of tokens)
        {
            if (token.type == T.OPEN_CURLY || token.type == T.ASSIGN)
            {
                break;
            }

            if (token.type == T.OPEN_SQUARE)
            {
                rootType = ArrayNode;
                break;
            }
        }

        return { rootType, tokens };
    }
}


module.exports  = { ConfigBuilder };


const { Tokenizer }   = require ("../core/Tokenizer");
const { Token }       = require ("../core/Token");
const { ObjectNode }  = require ("../nodes/ObjectNode");
const { ArrayNode }   = require ("../nodes/ArrayNode");
