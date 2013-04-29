shape.registerTypeBuilder("boolean",{
    native : true,
    initializer:function(type, args, memberDesc){
        if(memberDesc){
            return memberDesc.value;
        } else {
            return false;
        }
    }
});