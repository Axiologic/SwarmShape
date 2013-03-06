
ShapeUtil.prototype.initDOMHandling = function(){
    var shapeControllers = [];
    var shapeUrlRegistry = {};
    var shapeRegistry = {};
    var shapeAttributes = {};
    Shape.prototype.registerCtrl = function (name,functObj){
        //console.log("Registering controller " + name);
        shapeControllers[name] = functObj;
    }

    Shape.prototype.registerAttribute = function (name,functObj){
        //console.log("Registering controller " + name);
        shapeAttributes[name] = new ShapeAttribute(name,functObj);
    }

    Shape.prototype.shapeKnowsAttribute = function(name){
        return shapeAttributes[name] != undefined;
    }

    Shape.prototype.applyAttribute = function(name, dom,value,ctrl){
        var attr = shapeAttributes[name];
        if(attr) attr.applyAttribute(dom,value,ctrl);
    }



    Shape.prototype.registerShapeURL = function(viewName,url){
        shapeUrlRegistry[viewName] = url;
    }

    Shape.prototype.getController = function (ctrlName, parentCtrl){
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


    Shape.prototype.getPerfectShape = function(viewModel, usecase, callBack){
        var name = viewModel.getClassName();
        if(name==undefined){
            name  = typeof(viewModel);
        }
        var result = this.getShapeByName(name, usecase, callBack);
        if(!result){
            wprint("Unable to automatically detect a shape for " + J(viewModel));
        }
        return result;
    }

    Shape.prototype.getShapeByName = function(shapeName, usecase, callBack){
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

    Shape.prototype.expandShapeComponent = function(domObj, parentCtrl, rootModel){
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

    Shape.prototype.expandExistingDOM = function(domElem,parentCtrl,rootModel){
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
    Shape.prototype.localFilter = function(node, filter){
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
}
