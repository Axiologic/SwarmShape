/**
 * Utilities for bindable objects


  The main concept introduces:
    - ChangeWatcher : a method to observe changes in properties chains
    - properties chains ( ex:  person.parent.name is a chain of properties)


 Functions:
    makeBindable: make objects have unique local identity that will be returned at toString so objects can be used
    as keys in objects (you can use bindable objects as key in "maps" made from objects)

    setMetaAttr: add a meta attribute to a bindable objects
    getMetaAttr: ...

     addChangeWatcher(model, chain, handler): observe any changes that happens on a chain of properties starting from model
     removeChangeWatcher - clean a ChangeWatcher

 */

//public (global) functions
addChangeWatcher = function(model, chain, handler){
    var wrongLink = shape.checkChain(model, chain);
    if(!wrongLink){
        return new ChangeWatcher(model, chain, handler);
    }else{
        wprint("Found wrong link '"+wrongLink+"' from chain '"+chain+"' in model with type '"+getMetaAttr(model, SHAPE.CLASS_NAME)+"'!");
    }
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
        obj.__meta.__localId = localObjectsCount;
        localObjectsCount = localObjectsCount + 1;
        obj.__meta.bindableProperties = {};
    }
    if(obj.__meta.innerValues==undefined){
        obj.__meta.innerValues = {};
        obj.__meta.innerTransientValues = {};

        obj.getTransientValues = function(){
            return obj.__meta.innerTransientValues;
        }

        obj.getInnerValues = function(){
            return this.__meta.innerValues;
        }

        obj.getClassName = function(){
            return obj.__meta[SHAPE.CLASS_NAME];
        }
    }
}

//internal stuff


function ChangeWatcher(model, chain, handler){

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
           /* try{*/
                var newModel,oldModel, ref, parent;
                var i = startFrom;
                if(i == 0){
                    callBackRefs[0] = addWatcher(model, args[0], getWatcherClosure(1));
                    i = 1;
                }
                for(; i<=endOfChain; i++){

                    parent      = chainValues[i-1];
                    newModel    = parent[args[i-1]];
                    oldModel    = chainValues[i];
                    ref         = callBackRefs[i];
                    if(i!=endOfChain)
                    {
                        if(newModel == oldModel){
                            break;
                        } else {
                            if(ref != null){
                                removeWatcher(oldModel,args[i-1],ref);
                                callBackRefs[i] = null;
                            }

                            if(newModel){
                                callBackRefs[i] = addWatcher(newModel, args[i], getWatcherClosure(i+1));
                            }
                        }
                    }
                    chainValues[i] = newModel;
                }
            }
        /*catch(err){
                cprint("Unexpected error catch when processing chain " + chain + err,true);
                //cprint("Unexpected error on chain " + chain , err);
            }
        }*/

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


    function addWatcher(model,property, nw){
        //console.log("Adding watcher " + model + "." + property);
        var chainLink = shape.checkChain(model, property);
        if(chainLink)
        {
            wprint("Unknown property "+property+" in model "+J(model));
        }else{
            model.bindableProperty(property);
            shapePubSub.sub(model,nw, function(event){
                if(event.type == SHAPEEVENTS.PROPERTY_CHANGE){
                    if(event.property != property) {
                        return false;
                    }
                    else {
                        return true;
                    }
                } else if(event.type == SHAPEEVENTS.COLLECTION_CHANGE){
                    return true;
                }
                return false;
            });
        }
        return nw;
    }

    function removeWatcher(model,property,fctRef){
        shapePubSub.unsub(model,fctRef);
    }

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
        , value: function (prop) {
            var savedValue = this[prop];
            if(haveToExpandProperty(this, prop)){
                    getter = function (){
                        var res = this.getInnerValues()[prop];
                        if(res==undefined){
                            res = this.getTransientValues()[prop];
                        }
                        //todo lazy for
                        return res;
                    },
                    setter = function (value){
                        var inner = this.getInnerValues();
                        var oldval = inner[prop];
                        if(oldval !== value){
                            /*  we take a small test to see if the newVal that will be set on this.prop should
                             implement any interface. This test will not prevent any other operation(s).
                             */
                            shape.verifyObjectAgainstInterface(this, prop, value);
                            var newValue = value;
                            //if it has meta then is a full model object
                            // - else is a basic object(int, number, string, etc.)
                            var myClassDescription = shape.getClassDescription(getMetaAttr(this, SHAPE.CLASS_NAME));
                            if(myClassDescription){
                                newValue = myClassDescription.updateMemberValue(this,prop,value);
                            }else{
                                inner[prop] = value;
                            }
                            shapePubSub.pub(this, new PropertyChangeEvent(this, prop, newValue , oldval));
                            //shapePubSub.pub(this, new PropertyChangeEvent(this, prop, val, oldval));
                        }
                        return newValue;
                    };

                if (delete this[prop]){ // can't watch constants
                    Object.defineProperty(this, prop, {
                        get: getter
                        , set: setter
                        , enumerable: true
                        , configurable: true
                    });

                    //call the setter in the case when the previous values was useful
                    this[prop] = savedValue;
                }
            }
        }
    });
}


// when possible returns the "local id" instead of useless [Object]
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