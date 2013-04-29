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

function DOMCache(){
    var cache = {};
    var ctrlCache = {};

    function getComponentBinder(model, parentCtrl, callBack){
        return function(content){
            var newElem = $(content);
            switch(newElem.length){
                case 1:
                    newElem = newElem[0];
                    break;
                default:
                    wprint("Something is wrong... component should have only one root!!! "+content);
            }
            ctrlCache[model]=shape.expandExistingDOM(newElem, parentCtrl, model);
            cache[model] = newElem;
            callBack(newElem);
        }
    }

    function createDOMForModel(model, parentCtrl, callBack){
        if(cache[model] != undefined){
            callBack(cache[model]);
            ctrlCache[model].toView();
            return;
        }
        shape.getPerfectShape(undefined, model,parentCtrl.getContextName(),getComponentBinder(model, parentCtrl, callBack));
    }

    var refreshQueue = [];
    var duringRefresh = false;
    var self  = this;

    //Optimisation: use the Fence class form shapeUtil...

    this.doRefresh = function(coll, parentCtrl, startF, itemF, endF ){
        if(duringRefresh){
            refreshQueue.push({"coll":coll,
                            "parentCtrl":parentCtrl,
                            "startF":startF,
                            "itemF":itemF,
                            "endF":endF
                            });
            dprint("Pending...");
            return;
        }

        var endCounter = coll.length;
        startF();
        if(endCounter != 0){
            duringRefresh = true;
        } else{
            endF();
            return;
        }

        for(var i = 0; i < coll.length; i++){
            var m = coll.getAt(i);
            createDOMForModel(m,parentCtrl, function (newDom){
             itemF(newDom);

             endCounter--;

             if(endCounter == 0){
                 endF();
                 duringRefresh = false;
                 var x = refreshQueue.pop();
                 if(x != undefined){
                     self.doRefresh(x.coll, x.parentCtrl, x.startF, x.itemF, x.endF );
                 }
             }
            });
        }
    };
}
