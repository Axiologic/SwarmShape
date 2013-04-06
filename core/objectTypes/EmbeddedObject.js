shape.registerTypeBuilder("EmbeddedObject", {
    initializer:function(type, value, args) {
        /*var result;
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
        } */
        dprint("Not implemented");
        return result;
    },
    encode:function(outerObject){
        return outerObject.getInnerValues();
    },
    decode:function(member, innerValue){
        var res = shape.newObject(member.type);
        BasePersistence().prototype.defaultRefresh(res, innerValue)
    }
});
