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
        },
        factory: function(type,args,memberDesc){
            var result = {};
            makeEventEmitter(result);
            return result;
        },
        encode:function(outerObject){
            return outerObject;
        },
        decode:function(innerValue, member){
            return innerValue;
        }
    }
);