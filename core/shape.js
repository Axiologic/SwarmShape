cprint = function(str){
    console.log("Log:" + str);
}


dprint = function(str){
    console.log("Debug:" + str);
}


cprint("Loading shape...");

$.ajaxSetup({ cache: false });

shapeContext={
    controllers:[],
    views:[]
};


function loadShapeComponent(viewName, callBack){
    var fileName = "view/" + viewName + ".html";
    $.get(fileName,callBack );
}
function loadInnerHtml(domObj,viewName, ctrl){
    loadShapeComponent(viewName, function(data) {
        domObj.innerHTML = data;
        bindAttributes(domObj, ctrl);
        //shapeExpand(domObj, ctrl);
        ctrl.init();
    });
}

initialiseShape = function(domObj, model){
    ctrl = expandShape(domObj,null);
    ctrl.rootModel = model;
    ctrl.changeModel(model);

}


expandShapeWithModel = function(domObj, parentCtrl,model){
    ctrl = expandShape(domObj,parentCtrl);
    ctrl.rootModel = model;
    ctrl.changeModel(model);
}

insertShapeChild = function(parent, viewName, model){
    loadShapeComponent(viewName,function(data){
        parent.children().last().append(data);
        bindAttributes(parent.children().last(),parentCtrl);
    });

}

function expandShape(domObj, parentCtrl, rootModel){
    var modelChain = $(domObj).attr("shape-model");
    var ctrlName  = $(domObj).attr("shape-ctrl");
    var viewName  = $(domObj).attr("shape-view");
    var expandView = true;

    if(viewName == undefined){
        viewName = "base/" + domObj.nodeName.toLowerCase();
        expandView = false;
    }

    if(ctrlName == undefined){
        console.log("No control hint..." + viewName);
    }


    //console.log(" " + domObj +" Expanding " +  " viewCtrl: " + viewName +  " model chain: " + modelChain + " ctrl: " + ctrlName)
    var ctrl = getController(viewName, ctrlName);
    ctrl.view       = domObj;
    if(modelChain != undefined){
        ctrl.chain = modelChain.substring(1);
    }

    //ctrl.domView    = $(domObj);
    if(expandView == false){
        ctrl.init();
    }

    if(parentCtrl == null || parentCtrl == undefined){
        ctrl.parentCtrl = ctrl;
        ctrl.ctxtCtrl = ctrl;
        ctrl.rootModel = rootModel;
    } else{
        ctrl.parentCtrl = parentCtrl;
        ctrl.ctxtCtrl = parentCtrl.ctxtCtrl;
        if(rootModel != undefined){
            ctrl.rootModel = rootModel;
            ctrl.model     = rootModel;
            ctrl.changeModel(rootModel);
        } else{
            ctrl.rootModel = parentCtrl.rootModel;
        }

        bindAttributes(domObj,parentCtrl);

        if(ctrl.chain != ""){
            ctrl.chain = ctrl.getCompleteChain(ctrl.chain);
            //console.log("New chain " + ctrl.chain);
            parentCtrl.ctxtCtrl.addChangeWatcher__absolute(ctrl.chain,
                function(changedModel, modelProperty, value){
                    if(ctrl.parentCtrl != ctrl){
                        ctrl.parentModel = changedModel;
                        ctrl.parentModelProperty = modelProperty;
                    }
                    ctrl.changeModel(value);
                }
            );
        }
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
        console.log("No controller " + name);
    }

    for(var vn in newCtrl){
        var val = newCtrl[vn];
        if(typeof val == "function"){
            newCtrl[vn] = val.bind(newCtrl);
        }
    }
    return newCtrl;
}

