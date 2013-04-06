/**
 *
 * Class created to allow putting of functions as keys in maps
 * @param: a function
 */

function FunctionReference(funct){
    makeBindable(this);
    this.funct = funct;
}

FunctionReference.prototype.call = function(){
    var myThis =  arguments[0];
    var args = [];
    for(var i = 1; i < arguments.length; i++){
        args.push(arguments[i]);
    }
    this.funct.call(myThis,args);
}

FunctionReference.prototype.apply = function(myThis,args){
    this.funct.apply(myThis,args);
}
