/*
  Framework's main class:
   Features:
     1. register dependencies: controllers, models, views (shape urls) and custom attributes plugins
     2. create objects (transient, global): newObject, newTransient
     3. shaping DOM functions:

 3.0 expandShapeComponent = function(domObj, parentCtrl, rootModel): expand a tag with shape-view attribute
 3.1 expandExistingDOM = function(domElem,parentCtrl,rootModel): do bindings and shape expansions on existing DOM elements


 */
function Shape(){
    var shapeControllers = [];
    var shape = this;
    var classRegistry = {};

    var dataRegistries = {};
    var shapeUrlRegistry = {};
    var shapeRegistry = {};

    var shapeAttributes = {};

    this.registerCtrl = function (name,functObj){
        //console.log("Registering controller " + name);
        shapeControllers[name] = functObj;
    }

    this.registerAttribute = function (name,functObj){
        //console.log("Registering controller " + name);
        shapeAttributes[name] = new ShapeAttribute(name,functObj);
    }

    function shapeKnowsAttribute(name){
        return shapeAttributes[name] != undefined;
    }

    function applyAttribute(name, dom,value,ctrl){
        var attr = shapeAttributes[name];
        if(attr) attr.applyAttribute(dom,value,ctrl);
    }

    this.registerModel = function(modelName,declaration){
        classRegistry[modelName] = new QSClassDescription(declaration,modelName);
    }

    this.registerShapeURL = function(viewName,url){
        shapeUrlRegistry[viewName] = url;
    }

    this.getController = function (ctrlName){
        //dprint("Creating controller " + ctrlName);
        var newCtrl         = new BaseController(ctrlName);
        var base =  shapeControllers[ctrlName];
        if(base != undefined){
            for(var vn in base){
                if(typeof base[vn] == 'function'){
                    newCtrl[vn] = base[vn].bind(newCtrl);
                } else{
                    newCtrl[vn] = base[vn];
                }
            }
        } else{
            wprint("Unable to create controller " + ctrlName);
        }

        return newCtrl;
    }


    this.newObject = function(className){
        var res;
        var qsClass = classRegistry[className];
        if(qsClass != undefined){
            res = {};
            qsClass.attachClassDescription(res);
        }
        else{
            res = undefined;
            wprint("Undefined class " + className);
        }
        return res;
    }

    this.newTransientObject = function(className){
        var res = this.newObject(className);
        if(res){
            setMetaAttr(res,"persistence", "transient");
        }
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



    function loadInnerHtml(domObj,viewName, ctrl){
        shape.getShapeContent(viewName, function(data) {
            domObj.innerHTML = data;
            bindAttributes(domObj, ctrl);
            ctrl.changeView(domObj);
        });
    }

    this.expandShapeComponent = function(domObj, parentCtrl, rootModel){
        var ctrl;
        var viewName  = $(domObj).attr("shape-view");
        var modelChain = $(domObj).attr("shape-model");
        var ctrlName  = $(domObj).attr("shape-ctrl");


        if(parentCtrl && parentCtrl.isController == undefined){
            wprint("Wtf? Give me a proper controller!");
        }


        var transparentModel = false;
        if(modelChain != undefined){
            if(modelChain != "@"){
                modelChain = modelChain.substring(1);
            } else {
                transparentModel = true;
            }
        } else {
            transparentModel = true;
        }

        if(rootModel){
            transparentModel = false;
        }

        //do not create useless controllers if the element is used just to expand a component
        if(parentCtrl!= null && ctrlName == undefined && transparentModel){
            // we just expand but don't create any controller
            loadInnerHtml(domObj,viewName,parentCtrl);
            ctrl = null;
        } else {
            if(ctrlName == undefined){
                ctrlName = viewName;
            }

            ctrl = shape.getController(ctrlName);
            ctrl.hasTransparentModel = transparentModel;

            if(modelChain != undefined && !rootModel ){
                if(ctrl.hasTransparentModel){
                    ctrl.changeModel(parentCtrl.model);
                } else{
                    ctrl.chain = modelChain;
                }
            }

            if(parentCtrl == null || parentCtrl == undefined){
                ctrl.parentCtrl = ctrl;
                ctrl.ctxtCtrl = ctrl;
                ctrl.changeModel(rootModel);
            } else{
                ctrl.parentCtrl = parentCtrl;
                ctrl.ctxtCtrl = parentCtrl.ctxtCtrl;

                if(rootModel != undefined){
                    ctrl.isCWRoot = true;
                    ctrl.changeModel(rootModel);
                } else{
                    if(!ctrl.hasTransparentModel){
                        ctrl.addChangeWatcher("",
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
            }

            loadInnerHtml(domObj,viewName,ctrl);
        }
        return ctrl;
    }


    function expandHTMLElement(domObj, parentCtrl, rootModel, expandChilds){
        var modelChain = $(domObj).attr("shape-model");
        var ctrlName  = $(domObj).attr("shape-ctrl");

        if(parentCtrl.isController == undefined){
            wprint("Wtf? Give me a proper controller!");
        }

        var transparentModel = false;

        if(modelChain != undefined){
            if(modelChain != "@"){
                modelChain = modelChain.substring(1);
            } else{
                transparentModel = true;
            }
        } else {
            transparentModel = true;
        }


        if(ctrlName == undefined){
            ctrlName =  "base/" + domObj.nodeName.toLowerCase();
        }
        var ctrl = shape.getController(ctrlName);

        //cprint("New controller " + ctrl.ctrlName);


        ctrl.hasTransparentModel   = transparentModel;


        ctrl.parentCtrl = parentCtrl;
        ctrl.ctxtCtrl = parentCtrl.ctxtCtrl;

        if(ctrl.hasTransparentModel){
            ctrl.changeModel(parentCtrl.model);
        } else{
            if(modelChain != undefined){
                ctrl.chain = modelChain;
            }
        }

        if(rootModel != undefined){
            ctrl.isCWRoot = true;
            ctrl.changeModel(rootModel);
        } else {
            if(!ctrl.hasTransparentModel){
                ctrl.addChangeWatcher("",
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

        if(expandChilds == true){
            bindAttributes(domObj,ctrl);
        } else{
            bindDirectAttributes(domObj,parentCtrl);
        }
        ctrl.changeView(domObj);
        return ctrl;
    }

    this.expandExistingDOM = function(domElem,parentCtrl,rootModel){
        return expandHTMLElement(domElem,parentCtrl,rootModel,true);
    }

    function bindDirectAttributes(element,ctrl){
        $(element.attributes).each (
            function() {
                var attributeName = this.name;
                var value = this.value;
                if(shapeKnowsAttribute(attributeName)){
                    //dprint("\tbindingAttribute:" + attributeName  + " value " + this.value);
                    if(value[0] == "@"){
                        value = value.substring(1);
                        if(value!=""){
                            ctrl.addChangeWatcher(this.value.substring(1),
                                function(changedModel, modelProperty, value, oldValue ){
                                    //dprint("applyAttribute:" + attributeName);
                                    applyAttribute(attributeName,element,value,ctrl);
                                });
                        } else{
                            //TODO: we can detect model changes !?
                            applyAttribute(attributeName, element, ctrl.model ,ctrl);
                        }
                    } else{
                        applyAttribute(attributeName, element, value, ctrl);
                    }
                } else {
                    if(value[0] == "@"){
                        value = value.substring(1);
                        if(value!=""){
                            ctrl.addChangeWatcher(this.value,
                                function(changedModel, modelProperty, value, oldValue ){
                                    $(element).attr(attributeName,value);
                                });
                        } else{
                            //TODO: we can detect model changes !?
                            $(element).attr(attributeName,ctrl.model);
                        }
                    }
                }
            });
    }



    function elementIsShapeComponent(element){
        return element.hasAttribute("shape-view");
    }

    function elementIsShapedHtmlElement(element){
        return element.hasAttribute("shape-model") ||
            element.hasAttribute("shape-ctrl") ||
            element.hasAttribute("shape-event");
    }

    function bindAttributes(domObj, ctrl){
        var forExpand = [];
        if(ctrl.ctrlName == undefined){
            wprint("Wrong controller ",true);
        };

        $(domObj).find("*").each(function(index){
            var element = this;
            if(elementIsShapeComponent(element)){
                if(domObj != element){
                    forExpand.push(element);
                }
            } else
            if(elementIsShapedHtmlElement(element)){
                expandHTMLElement(element,ctrl);
            } else {
                bindDirectAttributes(element,ctrl);
            }
        });
        for (var i=0; i< forExpand.length; i++){
            //console.log("Element " + forExpand[i] + " get expanded" );
            shape.expandShapeComponent(forExpand[i], ctrl);
        }
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


//cprint("Loading shape...");


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


