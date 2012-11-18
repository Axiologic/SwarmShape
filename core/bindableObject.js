
J = function(obj) {
    var tmpObj={};
    for(var v in obj) {
        if(v != "__meta"){
            tmpObj[v] = obj[v];
        }
    }
    return JSON.stringify(tmpObj);
}

var localObjectsCount = 0;

var defaultToString = Object.prototype.toString;
Object.prototype.toString = function(){
    if(this.__meta != undefined){
        var typeName = this.__meta.className;
        if(typeName == undefined){
            if(typeof this == "string"){
                 typeName = "string:";
            }
            else {
                typeName = "obj:"
            }
        }
        else{
            typeName = typeName +":";
        }
       var retId = this.__meta.__globalId;

        if(typeof this == "array"){
            console.log("Array object");
        }
       if(retId != undefined){
           return retId;
       }
        else {
           retId = this.__meta.__localId;
           if(retId != undefined){
               retId = typeName + retId;
               //console.log("toString for object "+ retId);
           }
           else {
               retId = defaultToString.apply(this);
           }
       }
        return retId;
    }
    return defaultToString.apply(this);
}

function youAreBindable(obj){
    if(obj.__meta == undefined){
        obj.__meta = {};
        obj.__meta.watchers = {};
        obj.__meta.__localId = localObjectsCount;
        localObjectsCount = localObjectsCount + 1;
    }
}


function ChangeWatcher(model, chain, handler){
    youAreBindable(this);
    youAreBindable(model);
    this.model          = model;
    this.chain          = chain;
    this.handler        = handler;
    this.chainValues    = [];
    this.args           = this.chain.split(".");

    for(var i=0; i < this.args.length-1; i++){
        this.chainValues.push(null);
    }
    console.log("Creating changeWatcher " + this + " for model " + model + " chain " + chain );
    this.addWatcher(this.model, this.args[0]);
    this.onChange();
}

ChangeWatcher.prototype.cleanWatcher = function(poorObject){
    if(poorObject && poorObject.__meta.watchers != undefined){
        delete poorObject.__meta.watchers[this];
    }
}

ChangeWatcher.prototype.addWatcher  = function(poorObject,property){
    try{
        youAreBindable(poorObject);
        poorObject.__meta.watchers[this] = this;
        poorObject.bindablePropery(property);
        //console.log("Adding watcher " + poorObject + " :" + property );
    }
    catch(err) {
        wprint("Errrrror " + err + err.stack);
    }
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
    var parentModel;

    for( ; i < this.args.length-1; i++){
        parentModel = cmodel;
        cmodel = cmodel[this.args[i]];
        if(cmodel == null){
            for(; i < this.args.length-1; i++) {
                if(this.chainValues[i] != null) {
                    this.cleanWatcher(this.chainValues[i]);
                }
                this.chainValues[i] = null;
            }
            this.handler(null, null,null);
            return ;
        }
        else {
            if(cmodel != this.chainValues[i]){
                var oldModel = this.chainValues[i];
                this.cleanWatcher(oldModel);
                this.chainValues[i] = cmodel;
                this.addWatcher(parentModel, this.args[i]);
            }
        }
    }

    this.handler(cmodel, this.args[i], cmodel[this.args[i]]);
    //console.log("Calling back parent " + cmodel +  " property " + this.args[i] +  " value " + cmodel[this.args[i]]);
    return;
}

addChangeWatcher = function(model, chain, handler){
    return new ChangeWatcher(model, chain, handler);
}

removeChangeWatcher = function(changeWatcher){
    changeWatcher.release();
}


setMetaAttr = function(model,prop,value){
    model.__meta[prop] = value;
}

getMetaAttr = function(model,prop,value){
    return model.__meta[prop];
}

function callWatchers(model, prop, val, oldVal){
    var w = model.__meta.watchers;
    var length=0;

    for(var vn in w){
        w[vn].onChange(model, prop, val, oldVal);
        length++;
    }
    //console.log("Calling "+ length + " watchers for " + model + "::" + prop);
}

function haveToExpandProperty(obj, prop){
    //console.log("haveToExpandProperty " + obj + " " + prop);
    if(obj.__meta.bindablePropery[prop] == prop){
        return false;
    } else{
        obj.__meta.bindablePropery[prop] = prop;
        return true;
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
                        if(oldval !== val) {
                            callWatchers(this, prop, val, oldval);
                        }
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
