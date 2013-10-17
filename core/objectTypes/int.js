shape.registerTypeBuilder("int",{
    native : true,
    initializer:function(type, args, memberDesc){
            if(memberDesc && memberDesc.value){
                return parseInt(memberDesc.value);
            }else{
                return 0;
            }
        }
    }
);

shape.registerTypeBuilder("integer",{
        native : true,
        initializer:function(type, args, memberDesc){
            if(memberDesc && memberDesc.value){
                return parseInt(memberDesc.value);
            }else{
                return 0;
            }
        }
    }
);