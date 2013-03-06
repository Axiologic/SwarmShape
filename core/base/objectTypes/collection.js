shape.registerTypeBuilder("collection",{
    initializer:function(type, value, args, memberDescription){

        if(value == "null" || value === null){
            return null;
        }
        var res = new Collection();
        if(args != undefined || value != undefined){
            wprint("Collection initialisation not implemented");
        }
        if(memberDescription){
            setMetaAttr(res, "contains", memberDescription.contains);
        }
        return res;
    },
    encode:function(outerObject){
        xprint("Collection serialisation not implemented");

    },
    decode:function(outerObject, innerValue){
        xprint("Collection deserialisation not implemented");
    }
});