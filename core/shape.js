console.log("Loading shape...");

shape = function(domObj, view,model,ctrlName){
    if(ctrlName == undefined || ctrlName == null){
        ctrlName = view;
    }

    var ctrl = getController(ctrlName);
    $.get("view/"+view+".html", function(data) {
        ctrl.fill(data,model);
        domObj.innerHTML = data;
    });
}

shapeContext={
    controllers:[],
    views:[]
};



function BaseController(){

}

BaseController.prototype.fill = function(template,model){
    this.model = model;
    if(this.ctor != undefined){
        this.ctor(model);
    }
}

registerShapeController = function(name,functObj){
    console.log("Registering controller " + name);
    shapeContext.controllers[name] = functObj;
}

function getController(name,model){
    console.log("Lookup for controller" + name);
    var newCtrl = new BaseController();
    var specific =  shapeContext.controllers[name];
    for(var vn in specific){
        newCtrl[vn] = specific[vn];
    }
    return newCtrl;
}

shapeLookupModel = function(id){

}


shapeLookupCtrl = function(id){

}


