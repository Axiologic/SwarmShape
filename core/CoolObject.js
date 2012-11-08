
var localObjectsCount = 0;

var defaultToString = Object.prototype.toString;
Object.prototype.toString = function(){
    if(obj.__meta != undefined){
       var retId = obj.__meta.__globalId;
       if(retId != undefined){
           return retId;
       }
        else{
           defaultToString();
       }
       retId = obj.__meta.__localId;
        if(retId != undefined){
            localObjectsCount++;
            retId = ""+ localObjectsCount + "[LocalObject]";
        }
        return retId;
    }
}

Object.prototype.youAreCool = function(){
    if(this.__meta == undefined){
        this.__meta = {};
        this.__meta.watchers={};
    }
}



function ChangeWatcher(model, chain, handler){
    this.model          = model;
    this.chain          = chain;
    this.handler        = handler;
    this.chainValues    = [];
    this.args           = this.chain.split(".");
    for(;i < args.length-1;i++){
        chainValues.push(null);
    }

    this.onChange();
}

ChangeWatcher.prototype.cleanWatcher = function(poorObject){
    if(poorObject.__meta.watchers != undefined){
        delete poorObject.__meta.watchers[this];
    }
}

ChangeWatcher.prototype.addWatcher  = function(poorObject,property){
    poorObject.youAreCool();
    poorObject.__meta.watchers[this] = this;
    poorObject.bindablePropery(property);
}

ChangeWatcher.prototype.release  = function(){
    for(var i=0; i < this.args.length-1; i++) {
        if(this.chainValues[i] != null) {
            this.cleanWatcher(this.chainValues[i]);
        }
        this.chainValues[i] = null;
    }
}

ChangeWatcher.prototype.onChange = function(changedModel, property, value, oldValue ) {
    var i = 0;
    var cmodel = this.model;
    var propagateChangeMode = false;
    for(;i < this.args.length-1;i++){
        cmodel = cmodel[this.args[i]];
        if(cmodel == null){
            for(;i < this.args.length-1;i++) {
                if(this.chainValues[i] != null) {
                    this.cleanWatcher(this.chainValues[i]);
                }
                this.chainValues[i] = null;
            }
            this.handler(null, this.chain);
            return ;
        }
        else {
            oldModel = chainValues[i];
            if(!(oldModel === cmodel)){
                propagatChangeMode = true;
            }

            if(propagateChangeMode) {
                this.cleanWatcher(chainValues[i]);
                this.chainValues[i] = cmodel;
                this.addWatcher(this.chainValues[i], this.args[i]);
            }
        }
    }
    this.handler(cmodel[this.args[i]], this.chain);
    return;
}

addChangeWatcher = function(model, chain, handler){
    return new ChangeWatcher(model, chain, handler);
}

removeChangeWatcher = function(changeWatcher){
    changeWatcher.release();
}


setMeta = function(model,prop,value){
    model.youAreCool();
    model.__meta[prop] = value;
}


function callWatchers(model, prop, val, oldVal){
    var w = model.__meta.watchers;
    for(var i=0;i< w.length;i++){
        w[i].onChange(model, prop, val, oldVal);
    }
}

if (!Object.prototype.bindablePropery) {
    Object.defineProperty(Object.prototype, "bindablePropery", {
        enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop) {
            if(haveToExpandProperty(this, prop)){
                var oldval = this[prop],
                    newval = oldval,
                    getter = function () {
                        return newval;
                    },
                    setter = function (val) {
                        oldval = newval;
                        newval = val;
                        callWatchers(this, prop, val, oldVal);
                        return newval;
                    };

                if (delete this[prop]) { // can't watch constants
                    Object.defineProperty(this, prop, {
                        get: getter
                        , set: setter
                        , enumerable: true
                        , configurable: true
                    });
                }
            }
        }
    });
}

// object.unwatch: TODO: fix it because it is buggy (leaks inactive bindings and god knows what)
/*if (!Object.prototype.unwatchChange) {
    Object.defineProperty(Object.prototype, "unwatchChange", {
        enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop) {
            var val = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = val;
        }
    });
}
 */