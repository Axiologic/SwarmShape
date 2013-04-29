shape.registerTypeBuilder("string",{
    native : true,
    initializer:function(type, args, memberDesc){
        if(memberDesc && memberDesc.value){
            return memberDesc.value;
        }else{
            return "";
        }
    }
});