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
    var interfaceRegistry = {};
    var typeBuilderRegistry = {};

    var dataRegistries = {};
    var shapeUrlRegistry = {};
    var shapeRegistry = {};

    var shapeAttributes = {};

    var shapeLocaleRegistry = {};

    ShapeUtil.prototype.initUtil();
    ShapeUtil.prototype.initRepositories();


    this.registerCtrl = function (name,functObj){
        //console.log("Registering controller " + name);
        shapeControllers[name] = functObj;
    }

    this.registerAttribute = function (name,functObj){
        //console.log("Registering controller " + name);
        shapeAttributes[name] = new ShapeAttribute(name,functObj);
    }

    this.shapeKnowsAttribute = function(name){
        return shapeAttributes[name] != undefined;
    }

    this.applyAttribute = function(name, dom,value,ctrl){
        var attr = shapeAttributes[name];
        if(attr) attr.applyAttribute(dom,value,ctrl);
    }

    this.registerModel = function(modelName,declaration,ignoreOnBuild){
        var desc = new QSClassDescription(declaration,modelName);
        classRegistry[modelName] = desc;
        if(!ignoreOnBuild){
            this.registerTypeBuilder(modelName, {
                initializer:function(memberDescription, args) {
                    var result;
                    if(memberDescription != undefined){
                        var desc = memberDescription;
                        if(memberDescription.type){
                            if(memberDescription.value===null||memberDescription.value=="null"){
                                return null;
                            }
                            desc = shape.getClassDescription(memberDescription.type);
                        }
                        result = {};

                        try{
                            desc.attachClassDescription(result, args);
                        }catch(err){
                            dprint(err.message);
                        }
                    }
                    return result;
                },
                encode:function(outerObject){

                 },
                decode:function(){

                }
            }
            );
        }
    }

    this.getUpdateFunction = function(memberType){
        var f = typeUpdateRegistry[memberType];
        if(f == null){
            f = function(host,prop,value){
                wprint("Unknown update function for member "+ prop + " with type" + memberType + " in class " + host.getClassName());
            }
        }
        return f;
    }

    this.registerInterface = function(interfaceName, declaration){
        interfaceRegistry[interfaceName] = new InterfaceDescription(declaration,interfaceName);
        /* Because interfaces shouldn't be instantiated we return null every time from build function. */
        this.registerTypeBuilder(interfaceName, {initializer:function(){ return null}});
    }

    this.registerTypeBuilder = function(typeName, typeDescription){
        if(typeBuilderRegistry[typeName]){
            wprint("Shouldn't have more than one entry for "+typeName+" !");
        }
        typeBuilderRegistry[typeName] = typeDescription;
    }

    this.getTypeBuilder = function(typeName){
        return typeBuilderRegistry[typeName];
    }

    this.getClassDescription = function(modelName, ignoreWarning){
        var ret = classRegistry[modelName];
        if(ignoreWarning==undefined&&!ret){
            wprint("Undefined class " + modelName);
        }
        return ret;
    }

    this.getInterfaceDescription = function(modelName){
        return interfaceRegistry[modelName];
    }

    this.verifyObjectAgainstInterface = function (object, propertyName, newValue){
        var modelFields = this.getClassDescription(getMetaAttr(object,SHAPE.CLASS_NAME)).getFields();
        var newValueDesc = modelFields[propertyName];
        if(this.getInterfaceDescription(newValueDesc['type'])){
            if(!this.getInterfaceDescription(newValueDesc['type']).implementsYou(newValue)){
                dprint("You are trying to assign wrong type of object! Should implement interface "+newValueDesc['type']);
                return false;
            }
        }
        return true;
    }

    this.registerShapeURL = function(viewName,url){
        shapeUrlRegistry[viewName] = url;
    }

    this.getController = function (ctrlName, parentCtrl){
        //dprint("Creating controller " + ctrlName);
        var newCtrl         = new BaseController(ctrlName, parentCtrl);
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

    function ajaxCall(url, callBack){
        if(shapePubSub.hasChannel(url))
        {
            shapePubSub.sub(url, subCall);
            var subCall = function(response){
                shapePubSub.unsub(url, subCall);
                callBack(response.response);
            };
        }else{
            shapePubSub.addChannel(url);
            $.get(url, function(response){
                callBack(response);
                shapePubSub.pub(url, {"response":response});
            });
        }
    }

    function getShapeContent(shapeName, callBack){
        var requestedShapeName = shapeName;
        var content = shapeRegistry[shapeName];
        if( content == undefined){
            var fileName = shapeUrlRegistry[shapeName];
            if(fileName != undefined) {
                ajaxCall(fileName, function(newContent){
                    shapeRegistry[shapeName] = newContent;
                    shapeRegistry[requestedShapeName] = newContent;
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
        var name = getMetaAttr(viewModel, SHAPE.CLASS_NAME);
        if(name==undefined){
            name  = typeof(viewModel);
        }
        var result = this.getShapeByName(name, usecase, callBack);
        if(!result){
            wprint("Unable to automatically detect a shape for " + J(viewModel));
        }
        return result;
    }

    this.getShapeByName = function(shapeName, usecase, callBack){
        var name = shapeName;
        if(name != undefined) {
            shapeName = name + "." + usecase;
            if(shapeUrlRegistry[shapeName] != undefined){
                getShapeContent(shapeName,callBack);
                return true;
            }
            shapeName = name;
            if(shapeUrlRegistry[shapeName] != undefined){
                getShapeContent(shapeName,callBack);
                return true;
            }
            shapeName = name + ".default";
            if(shapeUrlRegistry[shapeName] != undefined){
                getShapeContent(shapeName,callBack);
                return true;
            }
        }
        wprint("Could not find html view:" + shapeName);
        return false;
    }

    function loadInnerHtml(domObj, viewName, ctrl, parentCtrl){
        var usecase = ctrl?ctrl.getContextName():"";
        shape.getShapeByName(viewName, usecase, function(data) {
            domObj.innerHTML = data;
            if(ctrl)
            {
                bindAttributes(domObj, ctrl);
                ctrl.changeView(domObj);
            }else{
                bindAttributes(domObj, parentCtrl);
            }
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
            ctrl = null;
            loadInnerHtml(domObj, viewName, ctrl, parentCtrl);

        } else {
            if(ctrlName == undefined){
                ctrlName = viewName;
            }

            ctrl = shape.getController(ctrlName, parentCtrl);
            ctrl.hasTransparentModel = transparentModel;

            if(modelChain != undefined && !rootModel ){
                if(ctrl.hasTransparentModel){
                    ctrl.changeModel(parentCtrl.model);
                } else{
                    if(shape.isChainExpression(modelChain)){
                        ctrl.chain = modelChain;
                    }else{
                        ctrl.chain = "";
                    }
                }
            }

            if(parentCtrl == null || parentCtrl == undefined){
                /*ctrl.parentCtrl = ctrl;
                ctrl.ctxtCtrl = ctrl;*/
                ctrl.changeModel(rootModel);
            } else{
                ctrl.ctxtCtrl = parentCtrl.ctxtCtrl;

                if(rootModel != undefined){
                    ctrl.isCWRoot = true;
                    ctrl.changeModel(rootModel);
                } else{
                   // if(!ctrl.hasTransparentModel){
                        ctrl.addChangeWatcher("",
                            function(changedModel, modelProperty, value){
                                if(ctrl.parentCtrl != null){
                                    ctrl.parentModel = changedModel;
                                    ctrl.parentModelProperty = modelProperty;
                                }
                                ctrl.changeModel(value);
                            }
                        );
                   // }
                }
            }

            loadInnerHtml(domObj,viewName,ctrl, parentCtrl);
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
        var ctrl = shape.getController(ctrlName, parentCtrl);

        //cprint("New controller " + ctrl.ctrlName);


        ctrl.hasTransparentModel   = transparentModel;
        ctrl.ctxtCtrl = parentCtrl.ctxtCtrl;

        if(ctrl.hasTransparentModel){
            ctrl.changeModel(parentCtrl.model);
        } else{
            if(modelChain != undefined){
                if(shape.isChainExpression(modelChain)){
                    ctrl.chain = modelChain;
                }else{
                    ctrl.chain = "";
                }
            }
        }

        if(rootModel != undefined){
            ctrl.isCWRoot = true;
            ctrl.changeModel(rootModel);
        } else {
            //if(!ctrl.hasTransparentModel){
                ctrl.addChangeWatcher("",
                    function(changedModel, modelProperty, value){
                        if(ctrl.parentCtrl != null){
                            ctrl.parentModel = changedModel;
                            ctrl.parentModelProperty = modelProperty;
                        }
                        ctrl.changeModel(value);
                    }
                );
            //}
        }

        if(expandChilds == true){
            bindAttributes(domObj,ctrl);
        } else{
            ctrl.bindDirectAttributes(domObj,parentCtrl);
        }
        ctrl.changeView(domObj);
        return ctrl;
    }

    this.expandExistingDOM = function(domElem,parentCtrl,rootModel){
        return expandHTMLElement(domElem,parentCtrl,rootModel,true);
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
                expandHTMLElement(element, ctrl);
            } else {
                ctrl.bindDirectAttributes(element, ctrl);
            }
        });
        for (var i=0; i< forExpand.length; i++){
            //console.log("Element " + forExpand[i] + " get expanded" );
            shape.expandShapeComponent(forExpand[i], ctrl);
        }
    }

    /**
     * Extension of jQuery filter method that search recursively in DOM but stops when it finds expanded
     * shapes(shape-view in attributes). It uses same parameters as jQuery filter method.
     *
     * Returns an array of DOM objects that pass filter condition or if array has only one items return the DOM object.
     * */
    this.localFilter = function(node, filter){
        var result = [];
        function innerFilter(innerNode, skip){
            //node = $(node);
            try{
                if(!innerNode.attr('shape-view')||skip){
                    //result = result.concat(node.children().filter(filter));
                    $.merge(result, innerNode.children().filter(filter));
                    innerNode.children().each(function(idx){innerFilter($(this))});
                }
            }catch(e){
                dprint(e.message);
            }
        }
        innerFilter($(node), true);
        return result;
    }

    /**
     *
     * Method used to check if chain members ar described in shape's models description.
     * Returns misspelled chain link or null if the chain is ok.
     *
     * */
    this.checkChain = function(model, chain){
        var chainItems = chain.split(".");
        if(chain==""){
            wprint("Chain can't be empty!");
            return "";
        }
        var classDesc = shape.getClassDescription(getMetaAttr(model, SHAPE.CLASS_NAME));
        for(var i=0; i<chainItems.length; i++){
            if(classDesc){
                var m = classDesc.getFields()[chainItems[i]];
                if(!m){
                    return chainItems[i];
                }else{
                    classDesc = shape.getClassDescription(m.type, true);
                }
            }else{
                var interfaceDesc = shape.getInterfaceDescription(m.type);
                //if i find an Interface in chain a have to stop checking
                if(interfaceDesc){
                    break;
                }
                return chainItems[i];
            }
        }
        return null;
    }

    this.isChainExpression = function(expression){
        var result = expression.match(/^((?:[^\W]+\.{1})*[^\W]*)$/);
       // console.log("expression "+expression+" result "+result);
        if(result!=null){
            return true;
        }
        return false;
    }

    this.registerLocale = function(language, dictionary){
        mergeInRepository(shapeLocaleRegistry, language, dictionary);
    }

    this.getLocaleKey = function(key, language){
        if(language==undefined){
            language = this.currentLanguage;
        }
        return shapeLocaleRegistry[language][key];
    }

    this.currentLanguage ="en";

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

function UrlHashChange(obj){
    this.type=SHAPEEVENTS.URL_CHANGE;
    for(var prop in obj){
        if(prop!= "type"){
            this[prop]=obj[prop];
        }else{
            wprint("Sorry dude, \"type\" is a keyword for hash fragments in Shape's URLs!");
        }
    }
}

function watchHashEvent(ctrl){
    function handler(e){
        var fragment = window.location.hash;
        var index = fragment.indexOf("#");
        if(index == -1) {
            fragment = "";
        } else{
            fragment = fragment.substr(index+1);
        }
        ctrl.emit(new UrlHashChange(fragmentToObject(fragment)));
    }
    $(window).bind('hashchange', handler);
    handler(null);
}

function navigateUsingObject(obj){
    window.location.hash = objectToFragment(obj);
}

L = function(key){
    try{
        var text = shape.getLocaleKey( key);
    }catch(err){
        //hoho
    }
    if(text==undefined){
        text = key;
    }
    return text;
}