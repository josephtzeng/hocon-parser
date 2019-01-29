var obj = {
    system: {
        concatenated: `Your home is ${process.env.HOME} and your shell is ${process.env.SHELL || ""}`
    }
};

for (let p of "HOME|PWD|SHELL|LANG|PATH".split ("|"))
{
    obj.system[p.toLowerCase ()] = process.env[p];
}


module.exports = obj;
