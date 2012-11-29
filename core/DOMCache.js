function DOMCache(){
    var cache = {};

    this.addElement = function(model,dom){
        cache[model] = dom;
    }

    this.getElement = function(model){
        return cache[model];
    }

    function getComponentBinder(model, parentCtrl, callBack){
        return function(content){
            var newElem = $(content);
            expandExistingDOM(newElem, parentCtrl, model);
            cache[model] = newElem;
            callBack(newElem);
        }
    }

    this.createDOMForModel = function(model, parentCtrl, callBack){
        if(cache[model] != undefined){
            callBack(cache[model]);
        }
        shape.getPerfectShape(model,null,getComponentBinder(model, parentCtrl, callBack));
    }

    var refreshQueue = [];
    var duringRefresh = false;

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
        if(endCounter != 0){
            duringRefresh = true;
            startF();
        }
        cprint("Start refreshing " + endCounter);
        for(var i = 0; i < coll.length; i++){
            var m = coll.getAt(i);
            this.createDOMForModel(m,parentCtrl, function (newDom){
             itemF(newDom);

             endCounter--;
             cprint("endCounter " + endCounter);
             if(endCounter == 0){
                 endF();
                 duringRefresh = false;
                 var x = refreshQueue.pop();
                 if(x != undefined){
                     this.doRefresh(x.coll, x.parentCtrl, x.startF, x.itemF, x.endF );
                 }
             }
            });
        }
    };
}
