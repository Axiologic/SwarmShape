shape.registerTypeBuilder("number",{
    initializer:function(type, value, args){
        if(value){
            return parseFloat(value);
        }else{
            return 0;
        }
    }
});