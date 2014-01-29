shape.registerTypeBuilder("collection",{
    native : false,
    initializer:function(type, args, memberDescription){
        if(args || (memberDescription && memberDescription.value)){
               wprint("Collection initialisation not implemented");
        } else {
            return null;
        }
    },
    factory:function(type, args, memberDescription){
        var res = new Collection();
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
        return outerObject.__meta.innerValues;

    },
    decode:function(innerValue){
        dprint("Collection deserialisation not implemented");
    }
});