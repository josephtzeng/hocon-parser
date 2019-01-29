const { ContentNode } = include ("lib/nodes/ContentNode");
const { Token }       = include ("lib/core/Token");

var node = new ContentNode ();

node.children.push (new Token (Token.TYPE.VALUE, null));
node.children.push (new Token (Token.TYPE.VALUE, "str"));


test.func (node, "onResolve")
    .should ("returns first non-empty value")
    .given ({})
    .returns ("str");
