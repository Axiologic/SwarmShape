var hasConsole = typeof console;


function linePrint(prefix,text, fullStack){
    var trace = printStackTrace();
    var strTrace;
    if(fullStack == undefined || fullStack == false){
        for(var i=0;i<trace.length;i++){
            if(trace[i].indexOf("linePrint") != -1){
                strTrace =  trace[i+2];
                if(strTrace != null){
                    strTrace = strTrace.replace(getBaseUrl(),"");
                } else{
                    strTrace = trace[trace.length -1];
                }
            }
        }
    }
    else{
        strTrace = "\n\n" + trace.join("\n") + "\n";
    }
    text = strTrace + ">>\t"  + text;

    if(hasConsole=="undefined")
    {
        console = prefix + text;
    }else{
        console.log(prefix + text);
    }

}

function cprint(str, fullStack){
    linePrint("",str, fullStack);
}




function dprint(str, fullStack){
    linePrint("Debug:",str,fullStack);
}

wprint = function(str,fullStack){
    linePrint("Warning:",str, fullStack);
}


$.ajaxSetup({ cache: false });


function Shape(){
    var shapeContext = {
        controllers:[],
        views:[]
    };

    var classRegistry = {};

    var dataRegistries = {};
    var shapeUrlRegistry = {};
    var shapeRegistry = {};


    this.registerCtrl = function (name,functObj){
        //console.log("Registering controller " + name);
        shapeContext.controllers[name] = functObj;
    }

    this.registerModel = function(modelName,declaration){
        classRegistry[modelName] = new QSClassDescription(declaration,modelName);
    }

    this.registerShapeURL = function(viewName,url){
        shapeUrlRegistry[viewName] = url;
    }

    this.getController = function (viewName, ctrlName){
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
                if(typeof base[vn] == 'function'){
                    newCtrl[vn] = base[vn].bind(newCtrl);
                } else{
                    newCtrl[vn] = base[vn];
                }
            }
            foundOne = true;
        }

        if(ctrlName != null && ctrlName != undefined){
            var specific =  shapeContext.controllers[ctrlName];
            for(var vn in specific){
                if(typeof specific[vn] == 'function'){
                    newCtrl[vn] = specific[vn].bind(newCtrl);
                } else{
                    newCtrl[vn] = specific[vn];
                }
            }
            foundOne = true;
        }

        if(!foundOne){
            wprint("No controller definition " + name);
        }

        for(var vn in newCtrl){
            var val = newCtrl[vn];
            if(typeof val == "function"){
                newCtrl[vn] = val.bind(newCtrl);
            }
        }
        return newCtrl;
    }


    this.newObject = function(className){
        var res = {};
        var qsClass = classRegistry[className];
        if(qsClass != undefined){
            qsClass.attachClassDescription(res);
        }
        else{
            wprint("Undefined class " + className);
        }
        return res;
    }

    this.newTransientObject = function(className){
        var res = this.newObject(className);
        setMetaAttr(res,"persistence", "transient");
        return res;
    }

    this.newPersistentObject = function(className){
        var res = this.newObject(className);
        //TODO: add in dataRegistries
        setMetaAttr(res,"persistence", "global");
        return res;
    }


    this.getShapeContent = function(shapeName, callBack){
        var content = shapeRegistry[shapeName];
        if( content == undefined){
            var fileName = shapeUrlRegistry[shapeName]
            if(fileName == undefined){
                shapeName =  shapeName + ".default";
                fileName = shapeUrlRegistry[shapeName]
            }

            if(fileName != undefined) {
                $.get(fileName, function(newContent){
                    shapeRegistry[shapeName] = newContent;
                    callBack(newContent);
                });
            } else{
                wprint("Could not find html view:" + shapeName);
            }
        } else {
            callBack(content);
        }
    }


    this.getPerfectShape = function(viewModel, usecase, callBack){
        var name = getMetaAttr(viewModel, "className");
        if(usecase == undefined || usecase == null){
            usecase = "default";
        }

        if(name != undefined) {
            name = name + "." + usecase;
            if(shapeUrlRegistry[name] != undefined){
                this.getShapeContent(name,callBack);
                return true;
            }
            name = name + ".default";
            if(shapeUrlRegistry[name] != undefined){
                this.getShapeContent(name,callBack);
                return true;
            }
        }
        wprint("Unable to automatically detect a shape for " + viewModel);
        return false;
    }
}



window.shape = new Shape();
shape = window.shape;

function getBaseUrl(){
    if(shape.baseUrl  == undefined){
        var l = window.location;
        shape.baseUrl = l.protocol + "//" + l.host + "/" + l.pathname.split('/')[1];
    }
    return shape.baseUrl;
}


function loadInnerHtml(domObj,viewName, ctrl){
    shape.getShapeContent(viewName, function(data) {
        domObj.innerHTML = data;
        bindAttributes(domObj, ctrl);
        //shapeExpand(domObj, ctrl);
        ctrl.init();
    });
}

function initialiseShape(domObj, model){
    ctrl = expandShape(domObj,null);
    ctrl.rootModel = model;
    ctrl.changeModel(model);

}


function expandShapeWithModel(domObj, parentCtrl,model){
    ctrl = expandShape(domObj,parentCtrl);
    ctrl.rootModel = model;
    ctrl.changeModel(model);
}

/*
insertShapeChild = function(parent, viewName, model){
    loadShapeComponent(viewName,function(data){
        parent.children().last().append(data);
        bindAttributes(parent.children().last(),parentCtrl);
    });
}
*/


function expandShape(domObj, parentCtrl, rootModel){
    var modelChain = $(domObj).attr("shape-model");
    var ctrlName  = $(domObj).attr("shape-ctrl");
    var viewName  = $(domObj).attr("shape-view");
    var expandView = true;

    if(parentCtrl && parentCtrl.isController == undefined){
        wprint("Wtf? Give me a proper controller!");
    }

    if(viewName == undefined){
        viewName = "base/" + domObj.nodeName.toLowerCase();
        expandView = false;
    }

    //console.log(" " + domObj +" Expanding " +  " viewCtrl: " + viewName +  " model chain: " + modelChain + " ctrl: " + ctrlName)
    var ctrl = shape.getController(viewName, ctrlName);
    //cprint("New controller " + ctrl.ctrlName);

    ctrl.view       = domObj;
    if(modelChain != undefined){
        if(modelChain == "@"){
            rootModel = parentCtrl.model;
        } else{
            ctrl.chain = modelChain.substring(1);
        }
    }

    //ctrl.domView    = $(domObj);

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
            ctrl.brakeChainCtrl = true;
        } else{
            ctrl.rootModel = parentCtrl.rootModel;
        }


        if(expandView == false){
            ctrl.init();
        }

        if(ctrl.chain != ""){
            ctrl.chain = ctrl.getCompleteChain(ctrl.chain);
            //cprint("New chain " + ctrl.chain);
            parentCtrl.addChangeWatcher__absolute(ctrl.chain,
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
    else{
        bindAttributes(domObj,ctrl);
    }

    return ctrl;
}

function shouldBeShapeExpanded(element){
    return element.hasAttribute("shape-model") ||
        element.hasAttribute("shape-view") ||
        element.hasAttribute("shape-ctrl") ||
        element.hasAttribute("shape-action");
}

function bindAttributes(domObj, ctrl){
    var forExpand = [];
    if(ctrl.ctrlName == undefined){
        wprint("Wrong controller ",true);
    };

    $(domObj).find("*").each(function(index){
        var element = this;
                if(shouldBeShapeExpanded(element)){
                    if(domObj != element){
                        forExpand.push(element);
                    }
                }
             $(this.attributes).each (
                 function() {
                     var attributeName = this.name;
                     if(this.value[0] =="@"){
                         ctrl.addChangeWatcher(this.value.substring(1),
                             function(changedModel, modelProperty, value, oldValue ){
                                 $(domObj).attr(attributeName,value);
                            });
                         //console.log("Binding " + attributeName);
                     } else if(this.value[0] =="$"){
                         wprint("Binding for " + attributeName + " as "+ this.value +" not yet implemented");
                     }
                 });
    });
   for (var i=0; i< forExpand.length; i++){
       //console.log("Element " + forExpand[i] + " get expanded" );
       expandShape(forExpand[i], ctrl);
   }
}

cprint("Loading shape...");


function watchHashEvent(ctrl){
    $(window).bind('hashchange', function(e) {
        var action = window.location.hash;
        var index = action.indexOf("#");
        if(index == -1) {
            action = "homePage";
        } else{
            action = action.substr(index+1);
        }
        ctrl.action(action);
    });
 // Trigger the event (useful on page load).
    //$(window).hashchange();
}


