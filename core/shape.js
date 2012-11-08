console.log("Loading shape...");
$.ajaxSetup({ cache: false });

J = JSON.stringify;
shapeContext={
    controllers:[],
    views:[]
};


setShape = function(domObj, viewName, ctrlName, contextCtrl, parentModel, chain){
    var ctrl = getController(viewName, ctrlName);

    if(contextCtrl == null){
        ctrl.ctxtCtrl = ctrl;
    } else{
        ctrl.ctxtCtrl = contextCtrl;
    }

    ctrl.rootModel  = parentModel;
    ctrl.chain      = chain;
    ctrl.view       = domObj;

    console.log("Binding chain " + chain + " with " + ctrl.ctrlName);
    addChangeWatcher(parentModel, chain, function(value,chain){
        ctrl.model  = model;
    });


    $.get("view/" + viewName + ".html", function(data) {
        domObj.innerHTML = data;
        shapeExpand(domObj, ctrl);
        ctrl.init();
    });
}

function bindAttributes(domObj, ctrl){
    $(domObj).each(function(index){
              var element = this;
             $(this.attributes).each(function(){
              var attributeName = this.name;
            if(this.value[0] =="@"){
                addChangeWatcher(model,this.value.substring(1), function(prop,oldVal,val){
                    element.attr(attributeName,val);
                })
                console.log("Binding " + attributeName);
            }
        });
    });
}

function shapeExpand(domObj, model, ctrl) {
    bindAttributes(domObj, model, ctrl);
    var elems = $(domObj).find('div');
    var attr;
    for(var i=0;i<elems.length;i++) {
        attr = elems[i].getAttribute("shape");
        if(attr != null) {
            var args = attr.split(" ");
            setShape(elems[i], args[0], args[2] , ctrl, ctrl.rootModel, ctrl.chanel + "." + args[1]);
            //console.log("ShapeExpanding: " + attr + "\n");
        }
    }
}


function BaseController(ctrlName){
  this.ctrlName = ctrlName;
}

BaseController.prototype.modelChanged = function(value, chain){
    console.log("Model changed to value " + value);
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


BaseController.prototype.addChangeWatcher  = function(chain,handler){
    return addChangeWatcher(this.model,chain,handler);
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


    for(var vn in newCtrl){
        var val = newCtrl[vn];
        if(typeof val == "function"){
            newCtrl[vn] = val.bind(newCtrl);
        }
    }
    return newCtrl;
}

shapeLookupModel = function(id){

}


shapeLookupCtrl = function(id){

}


