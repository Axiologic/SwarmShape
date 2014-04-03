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

    if(!model){
        wprint("Can't add change watcher for a null root model, with chain '" + chain +" handler ", handler);
        return ;
    }

    chain = chain.trim();
    var wrongLink = shape.checkChain(model, chain);
    if(!wrongLink ){
        return new ChangeWatcher(model, chain, handler);
    }else{
        wprint("Found wrong link (misspelling?) '"+wrongLink+"' from chain '"+chain+"' in model with type '"+ model.getClassName()+"'!");
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
        //keep a tree of serialisable (encoded) objects (transformable in JSON anytime)
        obj.__meta.innerValues = {};

        // keep a tree of models and decoded values
        obj.__meta.outerValues = {};

        // keep transient values
        obj.__meta.transientValues = {};

        obj.getOuterValues = function(){
            return obj.__meta.outerValues;
        }

        obj.getInnerValues = function(){
            return this.__meta.innerValues;
        }

        obj.getTransientValues = function(){
            return this.__meta.transientValues;
        }

        obj.getClassName = function(){
            var cdsc = obj.__meta[SHAPE.CLASS_DESCRIPTION];
            if(cdsc){
                return cdsc.className;
            } else {
                return "NoClass";
            }
        }

        obj.setPK = function(pk){
            var cdsc = obj.__meta[SHAPE.CLASS_DESCRIPTION];
            if(cdsc){
                var pkName = cdsc.getPkFieldName();
                this[pkName] = pk;
            }
        }

        obj.getPK = function(){
            var cdsc = obj.__meta[SHAPE.CLASS_DESCRIPTION];
            if(cdsc){
                var pkName = cdsc.getPkFieldName();
                if(pkName){
                    var res = this[pkName];
                    if(res){
                        return res;
                    }
                }
            }
            //cprint("Defaulting to localId pk");
            return obj.__meta.__localId;
        }

        obj.getClassDescription = function(){
            return obj.__meta[SHAPE.CLASS_DESCRIPTION];
        }
    }
}

//internal stuff


function ChangeWatcher(model, chain, handler){

        makeBindable(model);
        var model          = model;
        var chain          = chain;
        var handler        = handler;
        var deleted        = false;
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
                if(deleted){
                    wprint("calling a deleted watcher for " + model + chain);
                    chainValues    = [];
                    callBackRefs   = [];
                    handler = null;
                    model = null;
                    return;
                }
                try{
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
                        try{
                            handler(newParent,args[endOfChain-1],newValue, chain);
                        }catch(err){
                            wprint("Handler error: " + err.message + "\n" + handler);
                        }

                    }
                }   catch(err){
                    wprint("Binding error: " + err.message, err);
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
            deleted = true;
            //console.log("deleting changeWatcher " + this + " for model " + model + " chain " + chain );
            for(var i=0; i < callBackRefs.length; i++) {
                var ref = callBackRefs[i];
                if(ref != null){
                    removeWatcher(chainValues[i],args[i],ref);
                }
                chainValues[i] = null;
                callBackRefs[i] = null;
            }
        }

        rebuildWatchers(0);
        var newValue  = chainValues[endOfChain];
        var newParent = chainValues[endOfChain-1];
        if(isBindableCollection(newValue)){
            callBackRefs[endOfChain] = newValue.addWatcher(getWatcherClosure(endOfChain,true));
        }
        try{
            //console.log("Retrigering handler " + chain);
            handler(newParent,args[endOfChain-1],newValue, chain);
        }catch(err){
            eprint("Syntax error in handler: ", err);
        }



    function addWatcher(model,property, nw){
        //console.log("Adding watcher " + model + "." + property);
        var chainLink = shape.checkChain(model, property);
        if(chainLink){
            wprint("Unknown property "+property+" in model "+model.getClassName()+ " while evaluating chain " + chain);
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

function objectIsShapeSerializable(obj){
    return obj && obj.__meta != undefined;
}


if (!Object.prototype.bindableProperty) {
    Object.defineProperty(Object.prototype, "bindableProperty", {
        enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop) {
            var savedValue = this[prop];
            var classDesc = this.getClassDescription();
            var propDesc = classDesc.getMemberDescription(prop);

            var getter = function (){
                var res = this.getTransientValues()[prop];
                if(res != undefined){
                    return res;
                }
                res = this.getOuterValues()[prop];
                if(res != undefined){
                    return res;
                }
                res = this.getInnerValues()[prop];
                if(res != undefined){
                    if(classDesc){

                        if(propDesc){
                            var decodeFun = shape.getTypeBuilder(propDesc.type).decode;
                            if(decodeFun){
                                res = decodeFun(res, propDesc);
                            }
                        }
                        this.getOuterValues()[prop] = res;
                    }
                }
                return res;
            };
            var setter = function (value){
                var newValue = value;
                var oldValue;

                if(propDesc){
                    if(classDesc.isTransientMember(prop)) {
                        oldValue = this.getTransientValues()[prop];
                        this.getTransientValues()[prop] = value;
                    } else {
                        var isNativeType = shape.getTypeBuilder(propDesc.type).native;
                        if(isNativeType){
                            oldValue = this.getInnerValues()[prop];
                            this.getInnerValues()[prop] = value;
                            this.getOuterValues()[prop] = value;
                        } else {
                            if(propDesc.embed){
                                oldValue = this.getOuterValues()[prop];
                                if(value){
                                        if(value.setDirectOwner){
                                            value.setDirectOwner(this, prop);
                                        }
                                    this.getInnerValues()[prop] = value.getInnerValues();
                                } else {
                                    delete this.getInnerValues()[prop];
                                }
                            } else {
                                oldValue = this.getOuterValues()[prop];
                                if(value){
                                    if(propDesc.transient != true){
                                        if(value.setDirectOwner){
                                            value.setDirectOwner(this, prop);
                                        }
                                    }
                                    var encodeFun = shape.getTypeBuilder(propDesc.type).encode;
                                    if(encodeFun == undefined){
                                        encodeFun = shape.getTypeBuilder(value.getClassName()).encode;
                                    }
                                    this.getInnerValues()[prop] = encodeFun(value);
                                } else {
                                    delete this.getInnerValues()[prop];
                                }
                            }

                            this.getOuterValues()[prop] = value;
                        }
                    }
                } else {
                    //wprint("Auto-creating transient property " + prop );
                    oldValue = this.getTransientValues()[prop];
                    this.getTransientValues()[prop] = value;
                }

                if(oldValue !== newValue){
                    var pcev = new PropertyChangeEvent(this, prop, newValue, oldValue);
                    shapePubSub.pub(this, pcev);
                    if(!classDesc.isTransientMember(prop)){
                        shapePubSub.pub(this.__meta.owner, new DocumentChangeEvent(pcev));
                    }
                }
            }

                if(haveToExpandProperty(this, prop)){
                    if (delete this[prop]){ // can't watch constants
                        Object.defineProperty(this, prop, {
                            get: getter
                            , set: setter
                            , enumerable: true
                            , configurable: true
                        });
                    }
                        //use savedValue if the previous values was already created
                        if(classDesc){
                            if(propDesc && !classDesc.isTransientMember(prop)){
                                this.getOuterValues()[prop] = savedValue;
                            } else {
                                this.getTransientValues()[prop] = savedValue;
                            }
                        } else {
                            this.getTransientValues()[prop] = savedValue;
                        }
            }
        }
    });
}
// _defineSetter_ and _defineGetter_ for IE
try {
    if (!Object.prototype.__defineGetter__ &&
        Object.defineProperty({},"x",{get: function(){return true}}).x) {

        // Setter
        Object.defineProperty(
            Object.prototype,
            "__defineSetter__",
            {
                enumerable: false,
                configurable: true,
                value: function(name,func){
                    Object.defineProperty(this,name,{set:func,enumerable: true,configurable: true});

                    // Adding the property to the list (for __lookupSetter__)
                    if(!this.setters) this.setters = {};
                    this.setters[name] = func;
                }
            }
        );

        // Lookupsetter
        Object.defineProperty(
            Object.prototype,
            "__lookupSetter__",
            {
                enumerable: false,
                configurable: true,
                value: function(name){
                    if(!this.setters) return false;
                    return this.setters[name];
                }
            }
        );

        // Getter
        Object.defineProperty(
            Object.prototype,
            "__defineGetter__",
            {
                enumerable: false,
                configurable: true,
                value: function(name,func){
                    Object.defineProperty(this,name,{get:func,enumerable: true,configurable: true});

                    // Adding the property to the list (for __lookupSetter__)
                    if(!this.getters) this.getters = {};
                    this.getters[name] = func;
                }
            }
        );

        // Lookupgetter
        Object.defineProperty(
            Object.prototype,
            "__lookupGetter__",
            {
                enumerable: false,
                configurable: true,
                value: function(name){
                    if(!this.getters) return false;
                    return this.getters[name];
                }
            }
        );

    }
} catch(defPropException) {/*Do nothing if an exception occurs*/};


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
                typeName = "obj:";
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