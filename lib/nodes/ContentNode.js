const { Node } = require ("../core/Node");

const _ = require ("../utils");



class ContentNode extends Node
{
    onAppend (token)
    {
        this.children.push (token);

        return this;
    }


    onResolve (scope) // eslint-disable-line no-unused-vars
    {
        for (let c of this.children)
        {
            let v = c.value;

            if (v)
            {
                if (_.isObject (v))
                {
                    Node.merge (scope, v);
                }

                return v;
            }
        }
    }
}


module.exports = { ContentNode };
