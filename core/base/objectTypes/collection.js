shape.registerTypeBuilderFunction("collection",function(objectDescription, args){
    if(objectDescription.value!=undefined){
        if(objectDescription.value==null || objectDescription.value=="null"){
            return null;
        }
        return objectDescription.value;
    }else{
        var res = new Collection();
        setMetaAttr(res, "contains", objectDescription.contains);
        return res;
    }
});