shape.registerTypeBuilder("date",
    {
        initializer:function(objectDescription, args){
            if(objectDescription.value != undefined){
                if(objectDescription.value == null || objectDescription.value == "null"){
                    return null;
                }
                return new Date(objectDescription.value);
            } else {
                return new Date();
            }
        },
        encode:function(outerObject){
            //UTC time
            return outerObject.getTime();
        },
        decode:function(outerObject, innerValue){
            outerObject.setTime(innerValue);
        }
    }
);