shape.registerTypeBuilder("object",{
        native : true,
        initializer:function(type, args, memberDesc){
            if(memberDesc){
                if(memberDesc.value){
                    return eval(memberDesc.value);
                }else{
                    return null;
                }
            }
        }
    }
);