shape.registerTypeBuilder("int",{
    native : true,
    initializer:function(type, value, args){
            if(value){
                return parseInt(value);
            }else{
                return 0;
            }
        }
    }
);