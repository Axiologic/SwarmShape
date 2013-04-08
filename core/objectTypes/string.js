shape.registerTypeBuilder("string",{
    native : true,
    initializer:function(type, value, args){
        if(value){
            return value;
        }else{
            return "";
        }
    }
});