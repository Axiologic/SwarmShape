shape.registerTypeBuilder("function",{
    native : true,
    initializer:function(type, value, args){
        return value;
    }
});