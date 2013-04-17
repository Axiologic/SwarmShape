shape.registerTypeBuilder("GlobalObject", {
    native : false,
    initializer:function(type, value, args, memberDesc) {
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
        result.__meta.owner =  result;
        makeEventEmitter(result);
        return result;
    },
    encode:function(outerObject){
        return outerObject.__meta.pk;
    },
    decode:function(innerValue){
        return shape.lookup(innerValue,true,false);
        /*outerObject.setTime(innerValue);*/
    }
});
