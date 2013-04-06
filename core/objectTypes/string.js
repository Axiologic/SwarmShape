shape.registerTypeBuilder("string",{
    initializer:function(type, value, args){
        if(value){
            return value;
        }else{
            return "";
        }
    }
});