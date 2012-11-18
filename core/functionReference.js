
function FunctionReference(funct,ctxt){
    this.funct = funct.bind(ctxt);
    youAreBindable(this);
}

FunctionReference.prototype.call = function(){
    this.funct(arguments);
}

FunctionReference.prototype.apply = function(){
    this.funct(arguments);
}

createFunctionReference = function(funct,ctxt){
 return new FunctionReference(funct,ctxt);
}