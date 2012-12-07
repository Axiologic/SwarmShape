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
    setMetaAttr(this, SHAPE.CLASS_NAME, SHAPE.COLLECTION);
    this.__meta.bindableCollection = true;
    this.container = [];
    this.length = this.container.length;
}

Collection.prototype.announceChange = function(changeType){
    this.length = this.container.length;
    shapePubSub.pub(this, new CollectionChangeEvent(changeType));
}

Collection.prototype.pop = function(){
    var val = this.container.pop();
    this.announceChange("pop");
    return val;
}

Collection.prototype.push = function(elem){
    var val = this.container.push(elem);
    this.announceChange("push");
    return val;
}

Collection.prototype.removeAll = function(){
    this.container = [];
    this.announceChange("removeAll");
}

Collection.prototype.indexOf = function(item,startIndex){
     return this.container.indexOf(item,startIndex);
}

Collection.prototype.remove = function(item){
    var index = this.container.indexOf(item,0);
    if(this.container.splice(index,1) != -1){
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

Collection.prototype.insertAt = function(elem, index){
    this.container[index] = elem;
    this.announceChange("insert", index);
}

Collection.prototype.size = function(){
     return this.container.length;
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

Collection.prototype.reverse = function(){
    this.container.reverse();
    this.announceChange("reverse");
}

Collection.prototype.shuffle = function(){
    this.container.shuffle();
    this.announceChange("shuffle");
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

/**
 * because now chains are checked before watchers are created we need to register a fake model that has length property
 * so when "collection.length" chain it's checked every thing it's allright
 */
shape.registerModel(SHAPE.COLLECTION, {
    length : {
        type : "int"
    }
});
