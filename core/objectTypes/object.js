shape.registerTypeBuilder("object",{
        native : true,
        initializer:function(type, value, args){
            if(value){
                return eval(value);
            }else{
                return null;
            }
        }
    }
);