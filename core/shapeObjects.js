/**
 * Utilities for bindable object members, the shape way
 * The main concept: properties chains
 */

//public (global) functions
addChangeWatcher = function(model, chain, handler){
    return new ChangeWatcher(model, chain, handler);
}

removeChangeWatcher = function(changeWatcher){
    changeWatcher.release();
}


setMetaAttr = function(model,prop,value){
    model.__meta[prop] = value;
}

getMetaAttr = function(model,prop){
    if(model.__meta == undefined){
        return undefined;
    }
    return model.__meta[prop];
}


var localObjectsCount = 0;
makeBindable = function (obj){
    if(obj.__meta == undefined){
        obj.__meta = {};
        obj.__meta.watchers = {};
        obj.__meta.__localId = localObjectsCount;
        localObjectsCount = localObjectsCount + 1;
        obj.__meta.bindableProperties = {};
    }
}

//pretty print for bindable objects
J = function(obj) {
    var tmpObj={};
    for(var v in obj) {
        if(v != "__meta"){
            tmpObj[v] = obj[v];
        }
    }
    return JSON.stringify(tmpObj);
}


//internal stuff


function ChangeWatcher(model, chain, handler){
    try{
        makeBindable(model);
        var model          = model;
        var chain          = chain;
        var handler        = handler;
        var chainValues    = [];
        var callBackRefs   = [];
        var args           = chain.split(".");
        var endOfChain     = args.length;

        chainValues.push(model);
        callBackRefs.push(null);
        for(var i=0; i < args.length; i++){
            chainValues.push(null);
            callBackRefs.push(null);
        }
        //console.log("Creating changeWatcher " + this + " for model " + model + " chain " + chain );

        function getWatcherClosure (pos, isCollection){

            return function(changedModel, property, value, oldValue ){

                var myOldValue = chainValues[endOfChain];
                var oldParent  = chainValues[endOfChain-1];
                rebuildWatchers(pos);
                var newValue  = chainValues[endOfChain];
                var newParent = chainValues[endOfChain-1];

                if(isCollection || myOldValue != newValue || newParent != oldParent){

                    if(myOldValue != newValue && isBindableCollection(newValue)){
                        if(isBindableCollection(myOldValue)){
                            myOldValue.removeWatcher(callBackRefs[endOfChain]);
                        }
                        callBackRefs[endOfChain] = newValue.addWatcher(getWatcherClosure(endOfChain,true));
                    }
                    handler(newParent,args[endOfChain-1],newValue);
                }
            }
        }

        function rebuildWatchers(startFrom){
            var newModel,oldModel, ref, parent;
            var i = startFrom;
            if(i == 0){
                callBackRefs[0] = addWatcher(model, args[0], getWatcherClosure(1));
                i = 1;
            }
            for(; i<=args.length; i++){
                parent      = chainValues[i-1];
                newModel    = chainValues[i-1][args[i-1]];
                oldModel    = chainValues[i];
                ref         = callBackRefs[i];

                if(newModel == oldModel){
                    break;
                } else {
                    if(ref != null){
                        removeWatcher(parent,args[i-1],ref);
                    }
                    chainValues[i] = newModel;
                    //console.log("****Adding watcher " + parent + " " + args[i-1]);
                    callBackRefs[i] = addWatcher(parent, args[i-1], getWatcherClosure(i));
                }
            }
        }

        this.release  = function(){
            for(var i=0; i < callBackRefs.length; i++) {
                ref = callBackRefs[i];
                if(ref != null){
                    removeWatcher(this.chainValues[i],args[i],ref);
                }
                this.chainValues[i] = null;
            }
        }

        rebuildWatchers(0);
        var newValue  = chainValues[endOfChain];
        var newParent = chainValues[endOfChain-1];
        if(isBindableCollection(newValue)){
            callBackRefs[endOfChain] = newValue.addWatcher(getWatcherClosure(endOfChain,true));
        }
        handler(newParent,args[endOfChain-1],newValue);
    }
    catch(err){
        cprint("Unexpected error catch when processing chain " + chain );
        //cprint("Unexpected error on chain " + chain , err);
    }
}

function addWatcher(model,property, nw){
    //console.log("Adding watcher " + model + "." + property);
    if(model.__meta.watchers[property] == undefined){
        model.__meta.watchers[property] = {};
    }
    var w = model.__meta.watchers[property];
    var fctRef = model.bindableProperty(property, nw);
    w[fctRef] = fctRef;
    return fctRef;
}

function removeWatcher(model,property,nwRef){
    var w = model.__meta.watchers[property];
    w[nwRef] = null;
    delete w[nwRef];
}

function callWatchers(model, prop, val, oldVal){
    var w = model.__meta.watchers[prop];
    for(var vn in w){
        w[vn].call(model, prop, val, oldVal);
    }
    //console.log("Calling "+ length + " watchers for " + model + "::" + prop);
}

function haveToExpandProperty(obj, prop){
    //console.log("haveToExpandProperty " + obj + " " + prop);
    if(obj.__meta.bindableProperties[prop] == prop){
        return false;
    } else{
        obj.__meta.bindableProperties[prop] = prop;
        return true;
    }
}

if (!Object.prototype.bindableProperty) {
    Object.defineProperty(Object.prototype, "bindableProperty", {
        enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop, callBack) {
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
            var callBackRef = new FunctionReference(callBack,this);
            return callBackRef;
        }
    });
}

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
