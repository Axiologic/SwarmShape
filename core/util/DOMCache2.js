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


function DOMCache2(param_parentCtrl){
    var cache = {};
    var ctrlCache = {};
    var urgency = 0;
    var oldColl;
    var oldColl_length = 0;
    var parentCtrl = param_parentCtrl;

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
            urgency++;

            $(newElem).addClass('shape_loading');

            ShapeUtil.prototype.executeNext(function(){
                ctrlCache[model] = shape.expandExistingDOM(newElem, parentCtrl, model);
                $(newElem).removeClass('shape_loading');
            }, urgency, oldColl_length);
            cache[model] = newElem;
            callBack(placeHolder, newElem);
        }
    }

    function getCachedViewForModel(model){

        if(cache[model] != undefined){
            if(ctrlCache[model]) {
                //ctrlCache[model].toView();
            }
            return cache[model];
        }

        return null;
    }

    this.merge = function(model, view){
        urgency = 0;
        if(!model || !oldColl){
            oldColl = [];
            return;
        }

        /*if(oldColl != model){
            view.empty();
            oldColl = [];
        }*/


        var placeHolder, fromCache ;
        var inserts = 0;
        for(var i = 0, len = model.length; i< len; i++){
            var childList = view.children();
            var modelItem = model.getAt(i);

            fromCache = getCachedViewForModel(modelItem);
            placeHolder = null;
            if(!fromCache){
                placeHolder = document.createElement("div");
                fromCache = placeHolder;
            }


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
                   inserts++;
               }
           }

            if(placeHolder){
                shape.getPerfectShape(undefined, modelItem, parentCtrl.getContextName(), getComponentBinder(modelItem, placeHolder, function(placeHolder, expanded){
                    $(placeHolder).replaceWith(expanded);
                    cache[modelItem] = expanded;
                }));
            }
        }


        childList = view.children();
        var i = childList.length;
        oldColl.splice(model.length,oldColl.length - model.length);
        while(i > model.length){
            var child = childList[i-1];
            $(child).detach();
            i--;
        }
    }
}
