

shape.registerTypeBuilder("GlobalObject", {
    native : false,
    initializer:function(type, args, memberDesc) {
        if(memberDesc && memberDesc.value){
            wprint("Initialisation of a global object member is not implemented");
        } else {
            return null;
        }
    },
    factory: function(type,args,memberDesc){
        try{
            var result = new ModelObject(type, args,false);
            makeEventEmitter(result);
        } catch(err){
            wprint("Exception when creating an object with type ",type,args);
        }
        return result;
    },
    encode:function(outerObject){
        return outerObject.getPK();
    },
    decode:function(innerValue, propDesc){
        return shape.lookup(propDesc.type, innerValue);
        /*outerObject.setTime(innerValue);*/
    }
});
