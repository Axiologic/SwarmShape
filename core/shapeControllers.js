function BaseController(ctrlName){
    this.ctrlName = ctrlName;
    this.changeWatchers = [];
    this.chain = "";
}

BaseController.prototype.getCompleteChain = function(partial) {
    var chain;
    if( this.parentCtrl != this && this.parentCtrl.chain != ""){
        chain = this.parentCtrl.chain + "." + partial;
    } else{
        chain = partial;
    }
    return chain;
}

BaseController.prototype.init = function(){
    console.log("Calling BaseController's init function is probably wrong (missing a proper controller) for " + this.ctrlName);
}

BaseController.prototype.getCtxtCtrl = function(){
    return this.ctxtCtrl;
}

BaseController.prototype.addChangeWatcher = function(chain,handler){
    chain = this.getCompleteChain(chain);
    this.addChangeWatcher__absolute(chain,handler);
}

//add change watcher on an absolute chain (direct from context root model)
BaseController.prototype.addChangeWatcher__absolute = function(chain, handler){
    var watcher;
    if(this.model != null){
        watcher = addChangeWatcher(this.rootModel,chain,handler);
    }
    this.changeWatchers.push({"chain":chain,"handler":handler, "watcher":watcher});
}

BaseController.prototype.changeModel = function(model){
    this.model = model;
    /*
    //refresh all registered watchers
    if(this.ctxtCtrl == this){
        if(this.watchers != null){
            for(var i=0;i<this.watchers.length;i++){
                if(null != this.watchers[i].watcher){
                    this.watchers[i].watcher.release();
                }
                this.watchers[i].watcher =
                    addChangeWatcher(this.rootModel,
                        this.watchers[i].chain,
                        this.watchers[i].handler);
            }
        }
    }
    */
    this.onModelChanged();
    this.toView();
}

BaseController.prototype.onModelChanged = function(){

}


registerShapeController = function(name,functObj){
    //console.log("Registering controller " + name);
    shapeContext.controllers[name] = functObj;
}


BaseController.prototype.toView = function(){
    console.log("Calling BaseController's toView function is probably wrong (missing a proper controller) for " + this.ctrlName);
}

// UNDO/REDO and binding support is based on using those function when working with models

BaseController.prototype.arrayPush = function(arr,value){
    arr.push(value);
}


BaseController.prototype.arrayAssign = function(arr,index,value){
    return arr[index] = value;
}

BaseController.prototype.modelAssign = function(value){
    //console.log("Assigning property " + this.parentModelProperty + " in " + this.parentModel + " value " + value);
    this.parentModel[this.parentModelProperty]  = value;
}

