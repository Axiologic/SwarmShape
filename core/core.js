/* generic stuff*/


function getOrCreateMeta(model){
    if(model[".meta"] == undefined){
        model[".meta"] = {};
    }
    return model[".meta"];

}
setMeta = function(model,prop,value){
    var meta = getOrCreateMeta(model);
    meta[prop] = value;
}

function addMetaProp(model,metaName,value){
    var meta = getOrCreateMeta(model);
    if(meta[metaName] == undefined){
        meta[metaName] = [];
    }
    meta[metaName].push(value);
    return meta[metaName].length;
}


function callWatchers(model, prop, oldval, val){
    var w = model[".meta"]["watchers"];
    for(var i=0;i< w.length;i++){
        w[i].call(this, prop, oldval, val);
    }
}

function addWatcher(model,handler){
    return addMetaProp(model,"watchers",handler);
}

if (!Object.prototype.watchChange) {
    Object.defineProperty(Object.prototype, "watchChange", {
        enumerable: false
        , configurable: true
        , writable: false
        , value: function (prop, handler) {
            if(addWatcher(this,handler) ==1 ){
                var oldval = this[prop],
                    newval = oldval,
                    getter = function () {
                        return newval;
                    }
                    ,  setter = function (val) {
                        oldval = newval;
                        newval = val;
                        callWatchers(this, prop, oldval, val);
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

// object.unwatch
if (!Object.prototype.unwatchChange) {
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