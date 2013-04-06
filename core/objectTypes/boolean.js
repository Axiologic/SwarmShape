shape.registerTypeBuilder("boolean",{
    initializer:function(type, value, args){
        if(value!=undefined){
            if(value === null || value=="null"){
                return null;
            }
            return value;
        }else {
            return false;
        }
    }
});