cprint = function(str){
    console.log(str);
}


dprint = function(str){
    console.log(str);
}

//warning print
wprint = function(str){
    console.log(str);
}

cprint("Loading shape...");

$.ajaxSetup({ cache: false });

shapeContext={
    controllers:[],
    views:[]
};


function loadInnerHtml(domObj,viewName, ctrl){
    var fileName = "view/" + viewName + ".html";
    $.get(fileName, function(data) {
        domObj.innerHTML = data;
        bindAttributes(domObj, ctrl);
        //shapeExpand(domObj, ctrl);
        ctrl.init();
    });
}

initialiseShape = function(domObj, model){
    ctrl = expandShape(domObj,null);
    ctrl.changeModel(model);
    ctrl.chain = null;
}


function expandShape(domObj, parentCtrl){
    var modelChain = $(domObj).attr("shape-model");
    var ctrlName  = $(domObj).attr("shape-ctrl");
    var viewName  = $(domObj).attr("shape-view");
    var expandView = true;

    if(viewName == undefined){
        viewName = "base/" + domObj.nodeName.toLowerCase();
        expandView = false;
    }

    //console.log(" " + domObj +" Expanding " +  " viewCtrl: " + viewName +  " model chain: " + modelChain + " ctrl: " + ctrlName)
    var ctrl = getController(viewName, ctrlName);
    ctrl.view       = domObj;
    //ctrl.domView    = $(domObj);
    if(expandView == false){
        ctrl.init();
    }

    if(parentCtrl == null){
        ctrl.parentCtrl = ctrl;
        ctrl.ctxtCtrl = ctrl;
    } else{
        ctrl.parentCtrl = parentCtrl;
        ctrl.ctxtCtrl = parentCtrl.ctxtCtrl;

        bindAttributes(domObj,parentCtrl);
        var myChain = parentCtrl.getCompleteChain(modelChain.substring(1));
        parentCtrl.ctxtCtrl.addChangeWatcher__absolute(myChain,
            function(changedModel, modelProperty, value, oldValue ){
                ctrl.parentModel = changedModel;
                ctrl.parentModelProperty = modelProperty;
                ctrl.changeModel(value);
            }
        );
    }

    if(expandView){
        loadInnerHtml(domObj,viewName,ctrl);
    }
    return ctrl;
}

function bindAttributes(domObj, ctrl){
    var forExpand = [];
    $(domObj).find( "*").each(function(index){
        var element = this;
        //console.log("Element " + this.nodeName);
             $(this.attributes).each (
                 function() {
                     var attributeName = this.name;
                     if( attributeName == "shape-model") {
                         //console.log("Element " + element + " has " +  this.value);
                         if(domObj != element){
                             forExpand.push(element);
                         }
                     }
                     else if(this.value[0] =="@"){
                         var myChain = ctrl.getCompleteChain(this.value.substring(1));
                         ctrl.ctxtCtrl.addChangeWatcher__absolute(myChain,
                             function(changedModel, modelProperty, value, oldValue ){
                                     $(domElement).attr(attributeName,value);
                            });
                         //console.log("Binding " + attributeName);
                     }
                 });
    });
   for (var i=0; i< forExpand.length; i++){
       //console.log("Element " + forExpand[i] + " get expanded" );
       expandShape(forExpand[i], ctrl);
   }
}
/*
function shapeExpand(domObj, ctrl) {
    var elems = $(domObj).find('div');
    var shape;
    for(var i=0;i<elems.length;i++) {
        shape = elems[i].getAttribute("shape");
        if(shape != null){
            setShape(elems[i], shape, null, ctrl.ctxtCtrl, ctrl);
        }
    }
}
*/

function getController(viewName, ctrlName){

    var name = viewName;
    var foundOne = false;
    if(ctrlName != undefined && ctrlName != null    ){
        if(shapeContext.controllers[viewName] != undefined){
            name = ctrlName + "["+ viewName +"]";
        } else {
            name = ctrlName;
        }

    }
    //dprint("Creating controller " + name);
    var newCtrl         = new BaseController(name);

    var base =  shapeContext.controllers[viewName];
    if(base != undefined){
        for(var vn in base){
            newCtrl[vn] = base[vn];
        }
        foundOne = true;
    }

    if(ctrlName != null && ctrlName != undefined){
        var specific =  shapeContext.controllers[name];
        for(var vn in specific){
            newCtrl[vn] = specific[vn];
        }
        foundOne = true;
    }

    if(!foundOne)
    {
        wprint("No controller " + name);
    }

    for(var vn in newCtrl){
        var val = newCtrl[vn];
        if(typeof val == "function"){
            newCtrl[vn] = val.bind(newCtrl);
        }
    }
    return newCtrl;
}

