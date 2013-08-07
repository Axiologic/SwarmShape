function functionName(fun) {
    if(fun.className){
        return fun.className;
    }
    var ret = fun.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
}

function Class(className, parent, code) {
    Class.prototype[className] = window.eval("(function class__" + className + "(){})");
    //window[className] = Class.prototype[className];
    var refFunct = function () {
        var superName = functionName(parent);
        var self = new Class.prototype[className];
        self.super = {};

        self.super[superName] = function(){
            var baseSelf;
            if(parent.className != undefined){
                baseSelf = new Class.prototype[parent.className];
            } else{
                baseSelf = {};
            }
            self.super[superName] = baseSelf;
            parent.apply(baseSelf,arguments);
            for (var v in baseSelf) {
                if(self[v] == undefined){
                    self[v] = baseSelf[v];
                }
                if(typeof baseSelf[v] != "function"){
                    delete baseSelf[v]; //clean references
                }
            }
        }
        code.apply(self,arguments);
        return self;
    }

    refFunct.className = className;
    window[className] = refFunct;
}
