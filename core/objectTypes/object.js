shape.registerTypeBuilder("object",{
        native : true,
        initializer:function(type, args, memberDesc){
            if(value){
                return eval(value);
            }else{
                return null;
            }
        }
    }
);