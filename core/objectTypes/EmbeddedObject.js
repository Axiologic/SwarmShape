shape.registerTypeBuilder("EmbeddedObject", {
    native : false,
    initializer:function(type,args,memberDesc) {
        var defaultValue = memberDesc.value;
        if(!defaultValue){
            defaultValue = memberDesc.default;
        }
        if(defaultValue === null || defaultValue == "null"){
         return null;
        }
        return new ModelObject(type, args, null, true);
    },
    factory: function(type, args, memberDesc){
        var result = new ModelObject(type, args,true);
        return result;
    },
    encode:function(outerObject){
        return outerObject.getInnerValues();
    },
    decode:function(member, innerValue){
        var res = shape.newObject(member.type);
        BasePersistence().prototype.server2local(res, innerValue);
        return res;
    }
});
