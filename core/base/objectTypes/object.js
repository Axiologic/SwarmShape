shape.registerTypeBuilder("object",{
        initializer:function(type, value, args){
            if(value){
                return value;
            }else{
                return null;
            }
        }
    }
);