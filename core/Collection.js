/**
 *
 * @constructor
 */

isBindableCollection = function (obj){
    if(obj && obj.__meta != undefined){
        return obj.__meta.bindableCollection == true
    }
    return false;
}

function Collection(){
    makeBindable(this);
    this.__meta.watcherList = {};
    this.__meta.bindableCollection = true;
    this.container = [];
}

Collection.prototype.pop = function(){
    var val = this.container.pop();
    this.announceChanges("pop");
    return val;
}

Collection.prototype.push = function(elem){
    var val = this.container.push(elem);
    this.announceChanges("push");
    return val;
}

Collection.prototype.removeAll = function(){
    this.container = [];
    this.announceChanges("removeAll");
}

Collection.prototype.indexOf = function(item,startIndex){
     return this.container.indexOf(item,startIndex);
}

Collection.prototype.remove = function(item){
    var index = this.container.indexOf(item,0);
    this.container.splice(index,1);
    this.announceChanges("remove");
}

Collection.prototype.getAt = function(index){
      return this.container[index];
}

Collection.prototype.removeAt = function(index){
    this.container.splice(index,1);
    this.announceChanges("removeAt");
}

Collection.prototype.insertAt = function(elem, index){
    this.container[index] = elem;
    this.announceChanges("insert", index);
}

Collection.prototype.size = function(){
     return this.container.length;
}

var cp = Collection.prototype;
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
}


Collection.prototype.shift = function(){
   var first = this.container.shift();
   this.announceChanges("shift");
   return first;
}


Collection.prototype.unshift = function(value){
    var first = this.container.unshift(value);
    this.announceChanges("unshift");
    return first;
}

Collection.prototype.reverse = function(){
    this.container.reverse();
    this.announceChanges("reverse");
}

Collection.prototype.shuffle = function(){
    this.container.shuffle();
    this.announceChanges("shuffle");
}

Collection.prototype.clone = function(){
    var clone = new Collection();
    clone.container = this.container.slice(0);
    //this.announceChanges("clone");
    return clone;
}

Collection.prototype.copy = function(from){
    this.container = from.container.slice(0);
    this.announceChanges("copy");
}


Collection.prototype.addWatcher = function(callback){
    var fctRef = new FunctionReference(callback);
    this.__meta.watcherList[fctRef] = fctRef;
}

Collection.prototype.removeWatcher = function(fctRef){
    delete this.__meta.watcherList[fctRef];
}

Collection.prototype.announceChanges = function(type,start, end){
    var i = 0 ;
    for(var f in this.__meta.watcherList){
        i++;
        this.__meta.watcherList[f].call(null, type, start, end);
    }
}

