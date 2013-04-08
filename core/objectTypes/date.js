shape.registerTypeBuilder("date",{
        native : true,
        initializer:function(type, value, args){
            if(value != undefined){
                if(value === null || value == "null"){
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