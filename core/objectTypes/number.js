shape.registerTypeBuilder("number",{
    native : true,
    initializer:function(type, args, memberDesc){
        if(memberDesc && memberDesc.value){
            return parseFloat(memberDesc.value);
        }else{
            return 0;
        }
    }
});