shape.registerTypeBuilder("globalObject", {
    initializer:function(memberDescription, args) {
        var result;
        if(memberDescription != undefined){
            var desc = memberDescription;
            if(memberDescription.type){
                if(memberDescription.value===null||memberDescription.value=="null"){
                    return null;
                }
                desc = shape.getClassDescription(memberDescription.type);
            }
            result = {};
            try{
                desc.attachClassDescription(result, args);
            }catch(err){
                dprint(err.message);
            }
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
