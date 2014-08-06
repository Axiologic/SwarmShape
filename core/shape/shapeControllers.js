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
    this.__waitCounter = 1;
    this.children = {};
    makeBindable(this);
    /*
    setTimeout(function(){
       if(!this.initialised){
            wprint("Ctrl "+this.ctrlName+" isn't initialiazed! "+this.__waitCounter);
       }
    }.bind(this),3000);
    */
}


BaseController.prototype.init = function(){

}

BaseController.prototype.getCtxtCtrl = function(){
    return this.ctxtCtrl;
}




/*
 hasTransparentModel - doesn't have his own model,inherits the same wih he first non transparentModel
    isCWRoot = all change watchers will be relative to this ctrl, breaks the whole chain from context controller
*/
BaseController.prototype.addChangeWatcher = function(chain,handler, cause){
    var self = this;
    function createCW(ctrl, currChain){
        if(ctrl.parentCtrl == null || ctrl.isCWRoot){
            var watcher;
            //dprint("Chain " + ctrl.model.getClassName() + "->"+currChain);
            if(currChain==""){
                handler(null, null, ctrl.model);
            }else{
                watcher = addChangeWatcher(ctrl.model,currChain,handler);
                /*if(cause == 'Watching model :'){
                    if(ctrl.model && self.model ){
                        console.log(cause, " new ChangeWatcher for Chain \'" + chain + "\' -> "+currChain, ctrl.model.toString(), " from ", self.model.toString());
                    } else {
                        console.log(cause, " *new ChangeWatcher for Chain \'" + chain + "\' -> "+currChain);
                    }
                }*/
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

BaseController.prototype.watch = BaseController.prototype.addChangeWatcher;

function try2InitCtrl(ctrl){
    if(!ctrl.initialised){
        if(ctrl.modelInitialized && ctrl.view != undefined){

            var debugInfo = "ctrl: " + ctrl.ctrlName;

            if(ctrl.model && ctrl.model.meta){
                var modelName = ctrl.model.getClassName();
                debugInfo+= " Type of model:";
                debugInfo+= modelName;
            }

            $(ctrl.view).attr("shape-debug",debugInfo);

            Shape.prototype.checkTypeModelForController(ctrl.ctrlName,modelName);
            ctrl.initialised = true;
            ctrl.init();
            ctrl.onModelChanged(ctrl.model);
            ctrl.onViewChanged();
            ctrl.toView();
            if(ctrl.parentCtrl){
                ctrl.parentCtrl.afterExpansion(ctrl);
            }
        }
    }

}


BaseController.prototype.watchModelChanges = function(){
    var self = this;
    if(self.isCWRoot){
        if(self.chain){
            self.parentCtrl.addChangeWatcher(self.chain,
                function(changedModel, modelProperty, value){
                    self.changeModel(value);
                },
                "Watching model cwroot:"
            );
        }
    }
        else
        self.addChangeWatcher("",
            function(changedModel, modelProperty, value){
                if(self.parentCtrl != null){
                    self.parentModel = changedModel;
                    self.parentModelProperty = modelProperty;
                }
                self.changeModel(value);
            },
            "Watching model :"
        );

}


BaseController.prototype.onModelChanged = function(oldModel){

    var debugInfo = "ctrl: " + this.ctrlName;

    if(this.model && this.model.meta){
        var modelName = this.model.getClassName();
        debugInfo+= " Type of model:";
        debugInfo+= modelName;
    }

    $(this.view).attr("shape-debug",debugInfo);

    //console.log("model changed");
    /*if(oldModel !== this.model){
        var oldcw = this.changeWatchers;
        this.changeWatchers = [];
        for(var i = 0; i< oldcw.length; i++){
            oldcw[i]["watcher"].release();
            this.addChangeWatcher(oldcw[i].chain,oldcw[i].handler);
        }
    } */
}




BaseController.prototype.onViewChanged = function(){

}

BaseController.prototype.changeModel = function(model){
    try{
        var oldModel = this.model;
        if(this.isCWRoot){
            if(this.model && this.model!==model){
                if(this.canDestroyChildren()){
                    this.destroyChildren();
                }
            }
        }

        this.model = model;
        this.modelInitialized = true;
        this.onModelChanged(oldModel);
        if(this.initialised){
            this.toView();
        } else{
            try2InitCtrl(this);
        }
    } catch(err){
        eprint("Unknown error when changing models", err);
    }

}
BaseController.prototype.beginExpansion = function(){
    this.afterExpansion(this);
}

BaseController.prototype.changeView = function(view, ignore){
    this.view = view;
    view.shapeCtrl = this;
    this.beginExpansion();

}

BaseController.prototype.findDOMParentCtrl = function (domObj){
    var domParent = $(domObj).parent().get(0);
    if(domParent!=undefined&&domParent!=domObj){
        if(domParent.shapeCtrl){
            return domParent.shapeCtrl;
        }else{
            return this.findDOMParentCtrl(domParent);
        }
    }
    return null;
}

BaseController.prototype.waitExpansion = function(number){
    this.__waitCounter+=number;
}

BaseController.prototype.afterExpansion = function(caller){
    this.__waitCounter--;
    //if(this.__waitCounter==0){
        try2InitCtrl(this);
        this.afterChildExpansion(caller);
    //}
    if(caller==undefined){
        wprint("Warning, After expansion, caller undefined");
        return;
    }
    var parentId = parseInt(this.toString());
    var childId = parseInt(caller.toString());
    if(parentId > childId){
        wprint(this.ctrlName+" "+this.toString()+" has been announced by "+caller.ctrlName+" "+caller.toString());
    }
    if(caller!==this){
        this.children[caller] = caller;
    }
}

BaseController.prototype.afterChildExpansion = function(caller){
    if(this.parentCtrl){
        this.parentCtrl.afterChildExpansion(this);
    }
}

BaseController.prototype.canDestroyChildren = function(){
    return true;
}

BaseController.prototype.destroyChildren = function(){
    for(var i=0;i<this.changeWatchers.length; i++){
        var watcherObj = this.changeWatchers[i];
        try{
            watcherObj.watcher.release();
        }catch(err){
            eprint("destroyChildren:", err);
        }
    }
    this.changeWatchers = [];

    for(var childId in this.children){
        try{
            var child = this.children[childId];
            delete this.children[childId];
            child.destroyChildren();
        }catch(errr){
            eprint("destroyChildren:", errr);
        }
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
    if(this.contextExpression ){
        this.contextName = this.contextExpression.tryToEvaluate(this.parentCtrl);
    }

    if(this.contextName){
        return this.contextName;
    }
    if(this.parentCtrl != null){
        return this.parentCtrl.getContextName();
    }
}


BaseController.prototype.autoExpand = function(){
    if(this.forbidAnotherExpansion){
        //wprint("Error:" + this.view + "an ordinary html tags is not allowed to have shape attributes that trigger DOM expansion. Use DIV or SPAN instead.");
        /**
         * can't complain because shape-context is inherited
         * unfortunately is hiding some cases
         */
        return;
    }
    if(this.view){
        var self = this;
        if(!this.fence){
            this.__defineGetter__("dynamicContext",function(){
                return self.getContextName();
            });
            this.fence = new PropertiesFence(this, ["model","dynamicContext","autoViewName"], function(){
                //self.expander(function(){
                //self.afterExpansion(self);
                //});
                self.view.innerHTML = "";
                shape.getPerfectShape(self.autoViewName, self.model, self.getContextName(), function(newElem){
                    var ch = $(newElem);
                    $(self.view).append(ch);
                    shape.bindAttributes(self.view, self);
                });
            });
        }
        this.fence.acquire();
    }
}

BaseController.prototype.setParentCtrl = function(parent){
    this.parentCtrl = parent;
    makeEventEmitter(this, parent);
}

BaseController.prototype.applyHtmlAttribute = function(attributeName, element, value, overrideDefault){
    try{
        Shape.prototype.applyAttribute(attributeName, element, value,this);
    }catch(err){
        wprint("Failing to assign value " + value + " for attribute " + attributeName + " DOM element:" + $(element).get(0));
    }
}

BaseController.prototype.bindAttribute = function(ctrl, attr, element, parentCtrl){
    var attributeName = attr.name;
    var value = attr.value;
    ctrl.remember(attr.name, element);
    if(shape.shapeKnowsAttribute(attributeName)){
        //dprint("\tbindingAttribute:" + attributeName  + " value " + attr.value);
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
}

BaseController.prototype.bindDirectAttributes = function(element,parentCtrl){
    var ctrl = this;
    $(element.attributes).each (
        function() {
            if(!ctrl.remember(this.name, element)){
                ctrl.bindAttribute(ctrl, this, element, parentCtrl);
            }
        });
    //TODO:  review this stuff!!!!
    delete element.rememberString;
}

BaseController.prototype.remember = function (str, element){
    if(!element.rememberString){
        element.rememberString = [];
    }
    //console.log("remember "+this.rememberString[str]+" "+str);
    var orig  = element.rememberString[str];
    element.rememberString[str] = str;
    return orig;
}


BaseController.prototype.onViewNameChanged = function(){
    this.onViewChanged();
    this.toView(true);
    return null;
}

BaseController.prototype.onContextChanged = function(){
    this.onViewChanged();
    this.toView(true);
    return null;
}


BaseController.prototype.free = function(){
    this.destroyChildren();
    return null;
}
