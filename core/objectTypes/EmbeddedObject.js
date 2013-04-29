shape.registerTypeBuilder("EmbeddedObject", {
    native : false,
    initializer:function(type,args,memberDesc) {
        return null;
    },
    factory: function(type,args,memberDesc){
        var result = new ModelObject(type, args,true);
        makeEventEmitter(result);
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
