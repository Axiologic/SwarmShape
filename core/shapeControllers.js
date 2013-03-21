/*
     BaseController is a very important class for shape, controllers are the backbone of the framework

    Rules:
      - each controller has a view and a model
      - after model and view initialisation init() function are called
      - at changes in models, toView() function get called (onModelChanged and onViewChanged are called also)

    Other:
          - addChangeWatcher(chain,handler) -
          - event () : send an event for parents of this controller to handle
          - modelAssign: any change to this.model itself will not cause changes in parent model so if have to use this to
          really change something outside of current controller

    Type of controllers:
      - context controller: Controllers will form a tree of controllers starting from a context controller.
            Parent and context of such controllers is the controller itself.
      - parent controller: almost all controllers have a parent (parentCtrl)
      - Chain Root controller (isCWRoot property): chains in child will be relative to this one. The context controller
        is like a Chain root controller but isCWRoot is false)
      - transparent controllers (hasTransparentModels): those controllers that inherit their models from a parent
 */


function BaseController(ctrlName, parentCtrl){
    this.ctrlName = ctrlName;
    this.changeWatchers = [];
    this.chain = "";
    this.isCWRoot = false;
    this.hasTransparentModel = false;
    this.setParentCtrl(parentCtrl);
    this.ctxtCtrl   = null;
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
        if(ctrl.parentCtrl == null || ctrl.isCWRoot){
            var watcher;
            //dprint("Chain " + ctrl.model.getClassName() + "->"+currChain);
            if(currChain==""){
                handler(null, null, ctrl.model);
            }else{
                watcher = addChangeWatcher(ctrl.model,currChain,handler);
                self.changeWatchers.push({"chain":chain,"handler":handler, "watcher":watcher});
            }
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
    if(!ctrl.initialised){
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
    //wprint("Calling BaseController's toView function is probably wrong (missing a proper controller) for " + this.ctrlName);
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
    var wrongLink = shape.checkChain(this.parentModel, this.parentModelProperty);
    if(wrongLink){
      wprint("You can't assign property "+this.parentModelProperty+" on "+ this.parentModel.getClassName());
    }
    this.parentModel[this.parentModelProperty]  = value;
}

BaseController.prototype.getContextName = function(){
    if(this.contextName){
        return this.contextName;
    }
    if(this.parentCtrl != null){
        return this.parentCtrl.getContextName();
    }
}

BaseController.prototype.setParentCtrl = function(parent){
    this.parentCtrl = parent;
    makeEventEmitter(this, parent);
}

BaseController.prototype.applyHtmlAttribute = function(attributeName, element, value, overrideDefault){
    if(overrideDefault==undefined){
        try{
            $(element).attr(attributeName,value);
        }catch(err){
        }
    }
}

BaseController.prototype.bindDirectAttributes = function(element,parentCtrl){
    var ctrl = this;
    $(element.attributes).each (
        function() {
            var attributeName = this.name;
            var value = this.value;
            if(shape.shapeKnowsAttribute(attributeName)){
                //dprint("\tbindingAttribute:" + attributeName  + " value " + this.value);
                var exp = newShapeExpression(value);
                if(exp){
                    exp.bindToPlace(parentCtrl, function(changedModel, modelProperty, value, oldValue ){
                        shape.applyAttribute(attributeName,element,value,ctrl);
                    });
                }else{
                    shape.applyAttribute(attributeName, element, value,ctrl);
                }
            } else {
                var exp = newShapeExpression(value);
                if(exp){
                    exp.bindToPlace(parentCtrl, function(changedModel, modelProperty, value, oldValue ){
                        //$(element).attr(attributeName,value);
                        ctrl.applyHtmlAttribute(attributeName, element, value);
                    });
                }else{
                    ctrl.applyHtmlAttribute(attributeName, element, value, true);
                }
            }
        });
}




