function DOMCache(){
    var cache = {};

    /*
    this.addElement = function(model,dom){
     cache[model] = dom;
     }

     this.getElement = function(model){
     return cache[model];
     }
     */


    function getComponentBinder(model, parentCtrl, callBack){
        return function(content){
            var newElem = $(content);
            expandExistingDOM(newElem, parentCtrl, model);
            cache[model] = newElem;
            callBack(newElem);
        }
    }

    function createDOMForModel(model, parentCtrl, callBack){
        if(cache[model] != undefined){
            callBack(cache[model]);
            return;
        }
        shape.getPerfectShape(model,null,getComponentBinder(model, parentCtrl, callBack));
    }

    var refreshQueue = [];
    var duringRefresh = false;
    var self  = this;

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
