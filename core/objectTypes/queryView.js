shape.registerTypeBuilder("queryView",{
    native : false,
    initializer:function(type, value, args, memberDescription){
        if(value == "null" || value === null){
            return null;
        }
        var res = new queryView();
        if(args != undefined || value != undefined){
            wprint("Collection initialisation not implemented");
        }
        if(memberDescription){
            setMetaAttr(res, "contains", memberDescription.contains);
        }
        res.__meta.owner =  null;
        return res;
    },
    encode:function(outerObject){
        xprint("queryView serialisation will not be implemented");

    },
    decode:function(innerValue){
        xprint("queryView serialisation will not be implemented");
    }
});