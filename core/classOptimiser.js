
Shape.prototype.classCacheFactory = [];

Shape.prototype.makeStdNames = function(prefix, name){
    return prefix + "_" + name.replace(/[\/|\.]/, "_");
}

Shape.prototype.registerCtrlClass = function (className, template){

    var classUid = Shape.prototype.makeStdNames("ctrl",className) ;

    var aNewCtorFunction;
    var code = "aNewCtorFunction = function " + classUid + "(){";

    for(var v in template){
        if(typeof template[v] != "function"){
            code += "this."+ v + " = null;"
        }
    }

    code += ""
    code += "}";
    eval(code);

    //aNewCtorFunction = window[classUid] = function(){};
    window[classUid] = aNewCtorFunction;
    aNewCtorFunction.displayName = classUid;

    aNewCtorFunction.prototype = Object.create(BaseController.prototype);

    function getSafeFunction(self, funct , name){
        return  function(){
            shapePubSub.blockCallBacks();
            var args = ShapeUtil.prototype.mkArgs(arguments);
            try{
                var result = funct.apply(self,args);
            }   catch(err){
                eprint("Exception/Error from function " + className + "." + name , err);
            }
            shapePubSub.releaseCallBacks();
            return result;
        }
    }


    //var factCode = 'var newO = new ' + classUid + "();" + "BaseController.call(newO,args); return newO;";
    Shape.prototype.classCacheFactory[classUid] =  function(args){
        var newO = new window[classUid]();
        BaseController.apply(newO,args);

        for(var v in template){
            newO[v] = getSafeFunction(newO, template[v], v);
        }
        return newO;
    };
}

function registerModel(){

}

function newInstance(spaceName, className){
    var classUid = Shape.prototype.makeStdNames(spaceName, className);

    var factory = Shape.prototype.classCacheFactory[classUid];
    if(factory){
        var args = ShapeUtil.prototype.mkArgs(arguments, 2);
        return factory(args);
    }
    else {
        wprint("Unknown class " + classUid);
        return  new BaseController("fakeController");
    }
    return null;
}
