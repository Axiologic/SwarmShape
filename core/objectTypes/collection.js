shape.registerTypeBuilder("collection",{
    native : false,
    initializer:function(type, value, args, memberDescription, owner){
        if(value == "null" || value === null){
            return null;
        }
        var res = new Collection();
        res.__meta.owner =  owner;
        if(args != undefined || value != undefined){
            wprint("Collection initialisation not implemented");
        }
        if(memberDescription){
            setMetaAttr(res, "contains", memberDescription.contains);
        }
        makeEventEmitter(res);
        return res;
    },
    encode:function(outerObject){
        xprint("Collection serialisation not implemented");

    },
    decode:function(innerValue){
        xprint("Collection deserialisation not implemented");
    }
});