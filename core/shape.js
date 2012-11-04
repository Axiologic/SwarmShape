console.log("Loading shape...");
$.ajaxSetup({ cache: false });

J = JSON.stringify;
shapeContext={
    controllers:[],
    views:[]
};


setShape = function(domObj, viewName, model, ctrlName, contextCtrl, parentModel, chain){
    var ctrl = getController(viewName, ctrlName);
    ctrl.model  = model;
    if(contextCtrl == null){
        ctrl.ctxtCtrl = ctrl;
    } else{
        ctrl.ctxtCtrl = contextCtrl;
    }
    if(model == null){
        console.log("Binding chain " + chain + " with " + ctrl.ctrlName);
        model = bindChain(parentModel, chain, ctrl);
        console.log(model);
        ctrl.rootModel  = parentModel;
        ctrl.chain      = chain;
    }

    $.get("view/" + viewName + ".html", function(data) {
        domObj.innerHTML = data;
        /*if(model != null){
            setMeta(model, "ctrl", ctrl);
        }*/
        //setMeta(model,"view",domObj);
        ctrl.view   = domObj;
        ctrl.model  = model;
        shapeExpand(domObj, model, ctrl);
        ctrl.init();
    });
}

function shapeExpand(domObj, model, ctrl){
    var elems = $(domObj).find('div');
    var attr;
    for(var i=0;i<elems.length;i++){
        attr = elems[i].getAttribute("shape");
        if(attr != null){
            var args = attr.split(" ");
            setShape(elems[i], args[0], null, args[2] , ctrl, model, args[1]);
            //console.log("ShapeExpanding: " + attr + "\n");
        }
    }
}

function createBindingExecution(rootModel,chain, ctrl){
    return function(prop, oldval, val){
        ctrl.modelChanged(rootModel,chain);
        return val;
    }
}

function bindChain(rootModel, chain, ctrl){
    var args    = chain.split(".");
    var cmodel  = rootModel;

    for(var i=0;i < args.length;i++){
        cmodel.watchChange(args[i], createBindingExecution(rootModel, chain, ctrl));
        cmodel = cmodel[args[i]];
    }
    return cmodel;
}

function BaseController(ctrlName){
  this.ctrlName = ctrlName;
}

BaseController.prototype.modelChanged = function(rootModel, chain){
    var args    = chain.split(".");
    var cmodel  = rootModel;

    for(var i=0;i < args.length;i++){
        cmodel = cmodel[args[i]];
    }
    this.model = cmodel;
    console.log("Model changed " + this.ctrlName);
    //console.log(J(this));
    this.toView();
}

BaseController.prototype.chainAssign = function(value){
    var args    = this.chain.split(".");
    var cmodel  = this.rootModel;
    var i=0;

    for(;i < args.length-1;i++){
        cmodel = cmodel[args[i]];
    }
    console.log("Assigning " + value);
    cmodel[args[i]] = value;
}

BaseController.prototype.init = function(){
    console.log("Calling init from BaseController is probably wrong (missing a proper controller)" );
}


BaseController.prototype.getCtxtCtrl = function(){
    return this.ctxtCtrl;
}

registerShapeController = function(name,functObj){
    //console.log("Registering controller " + name);
    shapeContext.controllers[name] = functObj;
}


function getController(viewName, ctrlName){
    //console.log("Lookup for controller " + name);
    var newCtrl         = new BaseController(viewName+"+"+ctrlName);

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
    return newCtrl;
}

shapeLookupModel = function(id){

}


shapeLookupCtrl = function(id){

}


