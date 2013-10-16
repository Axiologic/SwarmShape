shape.registerTypeBuilder("array",{
    native : true,
    initializer:function(type, args, memberDesc){
            if(memberDesc && memberDesc.value){
                return JSON.parse(memberDesc.value);
            }else{
                return 0;
            }
        },
        factory:function(type, args, memberDescription){
            var res = [];
            if(args != null || (memberDescription && memberDescription.value)){
                res = JSON.parse(memberDesc.value);
            }
            makeEventEmitter(res);
            return res;
        },
        encode:function(outerObject){
            return outerObject;

        },
        decode:function(innerValue){
            return innerValue;
        }
    }
);

