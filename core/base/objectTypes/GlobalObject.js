shape.registerTypeBuilder("GlobalObject", {
    initializer:function(type, value, args) {
        var result;
        if(value === null || value == "null"){
            return null;
        }

        var desc = shape.getClassDescription(type);
        result = {};
        try{
            desc.attachClassDescription(result, args);
        }catch(err){
            dprint(err.message);
        }

        return result;
    },
    encode:function(outerObject){
        return outerObject.__meta.pk;
    },
    decode:function(innerValue, member){
        return shape.lookup(innerValue,true,member.transient);
        /*outerObject.setTime(innerValue);*/
    }
});
