console.log("Loading shape...");

shapeContext={
    controllers:[],
    views:[]
};

setShape = function(domObj, view,model,ctrlName){
    if(ctrlName == undefined || ctrlName == null){
        ctrlName = view;
    }

    var ctrl = getController(ctrlName);
    $.get("view/"+view+".html", function(data) {
        domObj.innerHTML = data;
        shapeExpand(domObj, model, ctrl);
    });
}

function shapeExpand(domObj, model, ctrl){
    var elems = $(domObj).find('div');
    var attr;
    for(var i=0;i<elems.length;i++){
        attr = elems[i].getAttribute("shape");
        if(attr != null){
            var args = attr.split(" ");
            var myModel = null

            if(args[1] != undefined){
                myModel = model[args[1]];
            }
            setShape(elems[i],args[0],myModel,null);
            console.log("ShapeExpanding: " + attr + "\n");
        }
    }
}

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
    console.log("Lookup for controller " + name);
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


