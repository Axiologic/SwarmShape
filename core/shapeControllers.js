function BaseController(ctrlName){
    this.ctrlName = ctrlName;
    this.changeWatchers = [];
    this.chain = "";
    this.isCWRoot = false;
    this.hasTransparentModel = false;
    this.parentCtrl = null;
    this.isController = true;
    this.initialised = false;
    this.model = undefined;
    this.view  = undefined;
}


BaseController.prototype.init = function(){
   // wprint("Calling BaseController's init function is probably wrong (missing a proper controller) for " + this.ctrlName);
}

BaseController.prototype.getCtxtCtrl = function(){
    return this.ctxtCtrl;
}

/*
 hasTransparentModel - doesn't have his own model,inherits the same wih he first non transparentModel
    isCWRoot = all change watchers will be relative to this ctrl, breaks the whole chain from context controller
*/
BaseController.prototype.addChangeWatcher = function(chain,handler){
    var self = this;
    function createCW(ctrl, currChain){
        if(ctrl == ctrl.parentCtrl || ctrl.isCWRoot){
            var watcher;
            //dprint("Chain " + ctrl.model + "->"+currChain);
            watcher = addChangeWatcher(ctrl.model,currChain,handler);
            self.changeWatchers.push({"chain":chain,"handler":handler, "watcher":watcher});
            return;
        }
        if(ctrl.hasTransparentModel) {
            return createCW(ctrl.parentCtrl, currChain);
        } else{
            var newChain = ctrl.chain;
            if(currChain != ""){
                newChain = ctrl.chain + "." + currChain;
            }
            return createCW(ctrl.parentCtrl, newChain);
        }
    }
    createCW(this, chain);
}

function try2InitCtrl(ctrl){
    if(!this.initialised){
        if(ctrl.model != undefined && ctrl.view != undefined){
            ctrl.initialised = true;
            ctrl.init();
            ctrl.onModelChanged();
            ctrl.onViewChanged();
            ctrl.toView();
        }
    }

}

BaseController.prototype.onModelChanged = function(){

}

BaseController.prototype.onViewChanged = function(){

}

BaseController.prototype.changeModel = function(model){
    if(this.isCWRoot && model == undefined){
        dprint("This is wrong, not possible...");
    }
    this.model = model;
    if(this.initialised){
        this.onModelChanged();
        this.toView();
    } else{
        try2InitCtrl(this);
    }
}

BaseController.prototype.changeView = function(view){
    this.view = view;
    if(this.initialised){
        this.toView();
        this.onViewChanged();
    } else {
        try2InitCtrl(this);
    }
}

BaseController.prototype.toView = function(){
    wprint("Calling BaseController's toView function is probably wrong (missing a proper controller) for " + this.ctrlName);
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

BaseController.prototype.action = function(type, model){
    if(this.parentCtrl != null && this.parentCtrl != this){
        this.parentCtrl.action(type, model);
    } else {
        wprint("Nobody is handling action " + type + " for " +model);
    }
}

