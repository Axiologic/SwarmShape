console.log("Loading shape...");
$.ajaxSetup({ cache: false });

shapeContext={
    controllers:[],
    views:[]
};


setShape = function(domObj, viewName, ctrlName, contextCtrl, parentCtrl){
    var ctrl = getController(viewName, ctrlName);

    if(contextCtrl == null){
        ctrl.ctxtCtrl = ctrl;
    } else{
        ctrl.ctxtCtrl = contextCtrl;
    }

    if(parentCtrl == null){
        ctrl.parentCtrl = ctrl;
    } else{
        ctrl.parentCtrl = parentCtrl;
    }

    ctrl.view       = domObj;
    ctrl.creationCompleted = false;

    $.get("view/" + viewName + ".html", function(data) {
        domObj.innerHTML = data;
        shapeExpand(domObj, ctrl);
        ctrl.init();
        ctrl.creationCompleted = true;
    });
    return ctrl;
}

setShapeWithModel = function(domObj, viewName, model){
    ctrl = setShape(domObj,viewName, null, null, null);
    ctrl.changeModel(model);
    ctrl.chain = null;
}

function returnChainClojure(ctrl,domElement,attributeName){
    return function(changedModel, modelProperty, value, oldValue ){
        if(attributeName == "model"){
            ctrl.parentModel = changedModel;
            ctrl.parentModelProperty = modelProperty;
            ctrl.changeModel(value);
        } else{
            $(domElement).attr(attributeName,value);
        }
    };
}

function returnElementClojure(ctrl,element){
    //console.log(element);
    return function(){
            var attributeName = this.name;
            if(this.value[0] =="@"){
                var myChain = ctrl.getCompleteChain(this.value.substring(1));
                if( attributeName == "model") {
                    ctrl.chain =  myChain;
                }
                ctrl.ctxtCtrl.addChangeWatcher__absolute(myChain,returnChainClojure(ctrl,element,attributeName));
                //console.log("Binding " + attributeName);
            }
    };
}

function bindAttributes(domObj, ctrl){
    $(domObj).each(function(index,element){
             $(this.attributes).each(returnElementClojure(ctrl,element));
    });
}

function shapeExpand(domObj, ctrl) {
    bindAttributes(domObj, ctrl);
    var elems = $(domObj).find('div');
    var shape;
    for(var i=0;i<elems.length;i++) {
        shape = elems[i].getAttribute("shape");
        if(shape != null){
            setShape(elems[i], shape, null, ctrl.ctxtCtrl, ctrl);
        }
    }
}

function BaseController(ctrlName){
  this.ctrlName = ctrlName;
  this.changeWatchers = [];
}

BaseController.prototype.getCompleteChain = function(partial) {
    var chain;
    if( this.parentCtrl != this && this.parentCtrl.chain != null){
        chain = this.parentCtrl.chain + "." + partial;
    } else{
        chain = partial;
    }
    return chain;
}


BaseController.prototype.chainAssign = function(value){
    console.log("Assigning property " + this.parentModelProperty + " in " + this.parentModel + " value " + value);
    this.parentModel[this.parentModelProperty]  = value;
}

BaseController.prototype.init = function(){
    console.log("Calling init from BaseController is probably wrong (missing a proper controller)" );
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
        watcher = addChangeWatcher(this.ctxtCtrl.model,chain,handler);
    }
    this.changeWatchers.push({"chain":chain,"handler":handler, "watcher":watcher});
}

BaseController.prototype.changeModel = function(model){
    this.model = model;

    //refresh all registered watchers
    if(this.ctxtCtrl == this){
        if(this.watchers != null){
            for(var i=0;i<this.watchers.length;i++){
                if(null != this.watchers[i].watcher){
                    this.watchers[i].watcher.release();
                }
                this.watchers[i].watcher =
                                addChangeWatcher(this.ctxtCtrl.model,
                                this.watchers[i].chain,
                                this.watchers[i].handler);
            }
        }
    }

    this.onModelChanged();
    //console.log("Model changed for " + this.ctrlName);
    this.toView();
}

BaseController.prototype.onModelChanged = function(){

}


registerShapeController = function(name,functObj){
    //console.log("Registering controller " + name);
    shapeContext.controllers[name] = functObj;
}


function getController(viewName, ctrlName){
    //console.log("Lookup for controller " + name);
    var name = viewName;
    if(ctrlName != undefined && ctrlName != null    ){
        name = ctrlName + "["+ viewName +"]";
    }
    var newCtrl         = new BaseController(name);

    var base =  shapeContext.controllers[viewName];
    if(base != undefined){
        for(var vn in base){
            newCtrl[vn] = base[vn];
        }
    } else{
        console.log("No controller for shape " + viewName);
    }

    if(ctrlName != null && ctrlName != undefined){
        var specific =  shapeContext.controllers[name];
        for(var vn in specific){
            newCtrl[vn] = specific[vn];
        }
    }


    for(var vn in newCtrl){
        var val = newCtrl[vn];
        if(typeof val == "function"){
            newCtrl[vn] = val.bind(newCtrl);
        }
    }
    return newCtrl;
}

