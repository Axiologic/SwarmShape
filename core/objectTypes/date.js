shape.registerTypeBuilder("date",{
        native : false,
        initializer:function(type, args, memberDesc){
            if(memberDesc && memberDesc.value){
                return new Date(memberDesc.value);
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