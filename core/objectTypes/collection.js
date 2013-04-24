shape.registerTypeBuilder("collection",{
    native : false,
    initializer:function(type, args, memberDescription, owner){
        if(args || (memberDescription && memberDescription.value)){
               console.log("Collection initialisation not implemented");
        } else {
            return null;
        }
    },
    factory:function(type, args, memberDescription, owner){
        var res = new Collection();
        res.__meta.owner =  owner;
        if(args != null || (memberDescription && memberDescription.value)){
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