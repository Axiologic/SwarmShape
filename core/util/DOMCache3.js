/*
  Helper class that provide  functionality for components that render collections of objects

  Problems it solves:
    - prevent non re-entrant refreshing for collections, will create proper UI for shape models (it will
  decide what shape to create for a model)
    - provide caching of views (shapes) it created. At refresh old views are reused, not re-created

  Main function: doRefresh = function(coll, parentCtrl, startF, itemF, endF )
    - coll is a shape Collection
    - parentCtrl is the controller of the component
    - startF - callback that will be called when refresh will start. usually disconnecting view children from parent
    - itemF - callback called for each item in the collection, add new DOM in parent component
    - endF - called at the end of a refresh
 */


function DOMCache3(param_parentCtrl, priorityList, pageSize){
    var cache = {};
    var ctrlCache = {};
    var urgency = priorityList;
    var oldColl = [];

    var parentCtrl = param_parentCtrl;
    var pagination = shape.newTransient("Pagination", pageSize);
    this.pagination = pagination;

    this.clearCache = function(){
         for(var v in cache ){
             if(ctrlCache[v]) {
                 ctrlCache[v].free();
             }
             delete cache[v];
             delete ctrlCache[v];
         }
    }

    if(!pagination.pageSize){
        pagination.pageSize = 5;
    }

    function getComponentBinder(model,placeHolder, callBack){
        return function(content){
            var newElem = $(content);
            switch(newElem.length){
                case 1:
                    newElem = newElem[0];
                    break;
                default:
                    wprint("Something is wrong... component should have only one root!!! "+content);
                    newElem = newElem[0];
            }

            ctrlCache[model] = false;
            if(!priorityList){
                urgency++;
            }

            $(newElem).addClass('shape_loading');

            ShapeUtil.prototype.executeNext(function(){
                ctrlCache[model] = shape.expandExistingDOM(newElem, parentCtrl, model);
                $(newElem).removeClass('shape_loading');
            }, urgency);
            cache[model] = newElem;
            callBack(placeHolder, newElem);
        }
    }

    function getCachedViewForModel(modelItem){
        var cachedView = cache[modelItem];
        if(cachedView != undefined){
            if(ctrlCache[modelItem]) {
                //ctrlCache[model].toView();
            }

        } else {
            var cachedView = $(document.createElement("div"));
            cachedView.attr("data_shape_DOMCache3",modelItem.toString());
            shape.getPerfectShape(undefined, modelItem, parentCtrl.getContextName(), getComponentBinder(modelItem, cachedView, function(cachedView, expanded){
                cachedView.attr("data_shape_DOMCache3",modelItem.toString());
                cachedView.append(expanded);
                cache[modelItem] = expanded;
            }));
        }
        return cachedView;
    }

    function cleanOrAddMore(model, view){
        var fromCache ;
        if(oldColl.length < model.length){
            fromCache = getCachedViewForModel(pagination);
            view.append(fromCache);
        } else {
            fromCache = getCachedViewForModel(pagination);
            $(fromCache).detach();
        }
    }

    function detachRemoved(model, view){
        var modelDict = {};
        var fromCache ;
        for(var i = 0, len = model.length; i<len; i++){
            modelDict[oldColl[i]] = true;
        }

        for(var i = oldColl.length-1; i >= 0; i--){
            var item = oldColl[i];
            if(!modelDict[item]){
                fromCache = getCachedViewForModel(item);
                $(fromCache).detach();
                oldColl.splice(i,1);
            }
        }
    }

    this.merge = function(model, view){
        urgency = 0;
        if(!model){
            oldColl = [];
            return;
        }
        detachRemoved(model, view);

        var fromCache ;
        var maxCount = pagination.pageSize < model.length ? pagination.pageSize : model.length;

        oldColl = [];
        for(var i = 0, len = maxCount; i< len; i++){
            var childList = view.children();
            var currentChild = $(childList[i]);
            var modelItem = model.getAt(i);
            oldColl.push(modelItem);

            fromCache = getCachedViewForModel(modelItem);
            var customAttrCC = currentChild.attr("data_shape_DOMCache3");
            if(childList.length <= i ){
                view.append(fromCache);
            } else {
                if(customAttrCC !== modelItem.toString()){
                    if(i == 0){
                        view.prepend(fromCache);
                    } else{
                        var prev =  $(childList[i-1]);
                        $(prev).after(fromCache);
                    }
                }
            }
        }


        childList = view.children();
        var i = childList.length;
        while(i > maxCount){
            var child = childList[i-1];
            $(child).detach();
            i--;
        }

        cleanOrAddMore(model, view);


    }
}
