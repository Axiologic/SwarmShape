shape.registerTypeBuilder("boolean",{
    native : true,
    initializer:function(type, value, args){
        if(value && value != "false"){
            return true;
        } else {
            return false;
        }
    }
});