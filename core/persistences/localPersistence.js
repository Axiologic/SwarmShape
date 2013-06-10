function LocalPersistence(spaceName){
    var classIndexCache = {};
    if(spaceName == undefined){
        spaceName = "default"
    }

    function createKey(className,pk){
        if(pk){
            return spaceName + "/" + className + "/" + pk;
        } else {
            return spaceName + "/" + className;
        }
    }

    function updateIndexCache(className, newId, deleteId){
        var cache = classIndexCache[className];
        if(cache == undefined){
            cache = Html5LocalStorage(createKey(className));
            if(cache == undefined){
                cache = {};
            }
            classIndexCache[className] = cache;
        }
        if(newId){
            if(deleteId){
                delete cache[newId];
                Html5LocalStorage(createKey(className), cache);
            } else{
                if(!cache[newId]){
                    cache[newId] = newId;
                    Html5LocalStorage(createKey(className), cache);
                }
            }
        }
        return cache;
    }

    /*
    delete object
     */
    this.delete = function(obj){
        Html5LocalStorage(createKey(obj.getClassName(),obj.getPK()), "");
        updateIndexCache(obj.getClassName(),obj.getPK(),true);
    }

    this.queryCounter = 0;
    //only called by query function
    this.query = function(queryName, params, queryUid){
        this.queryCounter++;
        if(queryName == "*"){
            if(!params || params[0] == undefined){
                wprint("Ignoring query" + queryName + "Class name is the first param of a query");
                return;
            }
            var className = params[0];
            var cache = updateIndexCache(className);

            for(var v in cache){
                shapePubSub.pub(queryUid,v);
            }
            shapePubSub.pub(queryUid,"end");
        }   else {
            wprint("Query in local storage is not implemented");
        }
        return this.queryCounter;
    }

    //send a persistence event towards server
    this.sendPersistenceEvent = function(className,pk){
        var jsonValue = Html5LocalStorage(createKey(className,pk));
        var ret = JSON.parse(jsonValue);
        this.onServerObjectRefresh(className, ret);
    }

    //event is a DocumentChange event
    this.onLocalChange = function(event){
        var obj;
        var cause = event.causes[0];
        if(cause.type == SHAPEEVENTS.PROPERTY_CHANGE){
            obj = cause.model.__meta.owner;
        } else{
            obj = cause.collection.__meta.owner;
        }
        if(obj == null){
            wprint("Something went wrong, can't persist wrong change event: " + J(event));
            return ;
        }
        Html5LocalStorage(createKey(obj.getClassName(), obj.getPK()), obj.getInnerValues());
        updateIndexCache(obj.getClassName(), obj.getPK());
    }
}

LocalPersistence.prototype = new BasePersistence();
BasePersistence.prototype.registerPersistence("local",new LocalPersistence());
