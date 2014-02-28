/**
 *  Collection class, used by shape models in place of standard arrays
 *
 *  What:
 *    - bindable (integrated in the pub/sub mechanism)
 *    - helper functions to work with collections in shape's models. Similar API cu JS arrays
 *    - length property is bindable
 */

isBindableCollection = function (obj){
    if(obj && obj.__meta != undefined){
        return obj.__meta.bindableCollection == true
    }
    return false;
}

function Collection(){
    makeBindable(this);
    this.__meta.innerValues = [];
    this.__meta.bindableCollection = true;
    this.container = [];
    this.length = this.container.length;
    setMetaAttr(this, SHAPE.CLASS_DESCRIPTION, shape.getClassDescription(SHAPE.COLLECTION));
    makeEventEmitter(this);
    this.__meta.changeIdentityCounter = 0;

    var self = this;
    function updateInner(){
        var o,r;
        self.__meta.innerValues.length = 0;
        for(var i=0; i< self.container.length; i++ ){
            o = self.container[i];
            if(typeof o == "object"){
                if(o.__meta != undefined && o.__meta.encodeFunction != undefined){
                    r = o.__meta.encodeFunction(o);
                } else {
                    r = o;
                }
            } else if(typeof o == "Collection"){
                r = o.__meta.innerValues;
            }
            else {
                r = o;
            }
            self.__meta.innerValues.push(r);
        }
    };

    this.on(SHAPEEVENTS.COLLECTION_CHANGE,updateInner);

    this.__sort;
    this.setSortFunction = function(func){
        this.__sort = func;
    }
}

Collection.prototype.sort = function(f){
    if(!f){
        f = this.__sort;
    }
    this.container.sort(f);
    this.announceChange("sort");
}

Collection.prototype.announceChange = function(changeType){
    this.length = this.container.length;
    if(this.__sort){
        this.container.sort(this.__sort);
    }

    var colChange = new CollectionChangeEvent(this, changeType);
    this.__meta.changeIdentityCounter++;
    this.emit(colChange);
    //updateInner();
    if(this.__meta.owner){
        shapePubSub.pub(this.__meta.owner, new DocumentChangeEvent(colChange));
    }
}

Collection.prototype.pop = function(){
    var val = this.container.pop();
    this.announceChange("pop");
    return val;
}

Collection.prototype.push = function(elem){
    this.canJoin(elem);
    var val = this.container.push(elem);
    this.announceChange("push");
    return val;
}

Collection.prototype.addToSet = function(elem){
    var index = this.container.indexOf(elem,0);
    if(index == -1){
        this.push(elem);
    }
}

Collection.prototype.addToSetFront = function(elem){
    var index = this.container.indexOf(elem,0);
    if(index == -1){
        this.unshift(elem);
    }
}

Collection.prototype.merge = function(elem){
    if ( elem instanceof Array || elem instanceof Collection) {
        for ( var item in elem) {
            this.push(item);
        }
    } else {
        this.push(elem);
    }
}

Collection.prototype.removeAll = function(){
    this.container = [];
    this.announceChange("removeAll");
}

Collection.prototype.deleteAll  = Collection.prototype.removeAll;
Collection.prototype.mkEmpty    = Collection.prototype.removeAll;

Collection.prototype.replaceInnerArray = function(arr){
    this.container = arr;
    this.announceChange("refreshAll");
}

Collection.prototype.indexOf = function(item,startIndex){
     return this.container.indexOf(item,startIndex);
}

Collection.prototype.remove = function(item){
    var index = this.container.indexOf(item,0);
    if(index != -1){
        this.container.splice(index,1);
        this.announceChange("remove");
    }
}

Collection.prototype.getAt = function(index){
      return this.container[index];
}

Collection.prototype.removeAt = function(index){
    this.container.splice(index,1);
    this.announceChange("removeAt");
}

Collection.prototype.setAt = function(elem, index){
    this.canJoin(elem);
    this.container[index] = elem;
    this.announceChange("insert", index);
}

Collection.prototype.map = function(callBack, myThis){
    return this.container.map(callBack, myThis);
}

Collection.prototype.forEach = function(callBack, myThis){
    if(myThis){
        return this.container.forEach(callBack, myThis);
    } else {
        return this.container.forEach(callBack);
    }
}

Collection.prototype.reduce = function(callBack, initialValue){
    return this.container.reduce(callBack, initialValue);
}

Collection.prototype.size = function(){
     return this.container.length;
}
/**
 *
 * Method canJoin checks if a new item passes <contains> filter
 *
 * */
Collection.prototype.canJoin = function(item){
    var contains = getMetaAttr(this,"contains");
    if(contains){
        var desc = shape.getInterfaceDescription(contains);
        if(desc){
            if(!desc.implementsYou(item)){
                wprint("This collection expects objects to implement interface "+contains+" and your "+ item.getClassName() +" doesn't implement!");
            }
        }else{
            var itemClass = item.getClassName();
            if(contains==itemClass){
            }else{
                wprint("This collection expects objects with type "+contains+" and your are trying to add objects with type "+itemClass+"!");
            }
        }
    }
}

/*var cp = Collection.prototype;
try{
    cp.__defineGetter__("length", function() {
        return this.container.length; });
}catch(e){
    try{
        Object.defineProperty(cp, "length",{
            get: function() { return this.container.length; }
        });
    }catch(ex){
        cprint("Failing to define length property" + ex.message);
    }
}*/

Collection.prototype.shift = function(){
   var first = this.container.shift();
   this.announceChange("shift");
   return first;
}


Collection.prototype.unshift = function(value){
    var first = this.container.unshift(value);
    this.announceChange("unshift");
    return first;
}

Collection.prototype.insertFront = Collection.prototype.unshift;
Collection.prototype.removeFront = Collection.prototype.shift;

Collection.prototype.reverse = function(){
    this.container.reverse();
    this.announceChange("reverse");
}

Collection.prototype.shuffle = function(){
    this.container.shuffle();
    this.announceChange("shuffle");
}

Collection.prototype.insertAt = function(item,index){
    this.container.splice(index, 0, item);
    this.announceChange("insert");
}

Collection.prototype.clone = function(){
    var clone = new Collection();
    clone.container = this.container.slice(0);
    //this.announceChange("clone");
    return clone;
}

Collection.prototype.copy = function(from){
    this.container = from.container.concat();
    this.announceChange("copy");
}

Collection.prototype.addWatcher = function(callBack, filter){
    shapePubSub.sub(this,callBack, filter);
    return callBack;
}

Collection.prototype.removeWatcher = function(fctRef,callBack,filter){
    shapePubSub.unsub(this,callBack,filter);
}

Collection.prototype.setDirectOwner = function(owner, property){
    if(this.__meta.owner == undefined){
        this.__meta.directOwner             = owner;
        this.__meta.directOwnerProperty     = property;
        var myOwner = owner;
        while(myOwner != myOwner.__meta.owner){
            myOwner = myOwner.__meta.directOwner;
        }
        this.__meta.owner = myOwner;
        owner.__meta.innerValues[property] = this.__meta.innerValues;
    } else{
        wprint("It is wrong to assign an embedded collection as persistent member of another object!");
    }
}


/**
 * because now chains are checked before watchers are created we need to register a fake model that has length property
 * so when "collection.length" chain it's checked every thing it's all right
 */
shape.registerModel(SHAPE.COLLECTION, {
    length : {
        type : "int",
        transient : true
    }
},true);
