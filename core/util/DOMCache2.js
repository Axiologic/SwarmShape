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


function DOMCache2(param_parentCtrl, priorityList, pageSize){
    var cache = {};
    var ctrlCache = {};
    var urgency = priorityList;
    var oldColl;

    var parentCtrl = param_parentCtrl;
    var pagination = shape.newTransient("Pagination", pageSize);
    this.pagination = pagination;

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
            shape.getPerfectShape(undefined, modelItem, parentCtrl.getContextName(), getComponentBinder(modelItem, cachedView, function(cachedView, expanded){
                $(cachedView).append(expanded);
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

    this.merge = function(model, view){
        urgency = 0;
        if(!model || !oldColl){
            oldColl = [];
            return;
        }

        var fromCache ;
        var maxCount = pagination.pageSize < model.length ? pagination.pageSize : model.length;

        for(var i = 0, len = maxCount; i< len; i++){
            var childList = view.children();
            var modelItem = model.getAt(i);

            fromCache = getCachedViewForModel(modelItem);
            if(oldColl.length <= i ){
                view.append(fromCache);
                oldColl.push(modelItem);
            }else {
                if(oldColl[i] !== modelItem){
                    if(i == 0){
                        view.prepend(fromCache);
                    } else{
                        var prev = childList[i-1];
                        $(fromCache).insertAfter(prev);
                    }
                    oldColl.splice(i,0,modelItem);
                }
            }
        }


        cleanOrAddMore(model, view);

        childList = view.children();
        var i = childList.length;

        var removeCount = oldColl.length - maxCount;
        if(removeCount > 0 ){
            oldColl.splice(maxCount - 1,  removeCount);
        }

        while(i > maxCount){
            var child = childList[i-1];
            $(child).detach();
            i--;
        }

        cleanOrAddMore(model, view);
    }
}
