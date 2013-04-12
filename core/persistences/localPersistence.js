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
            cache = $.localStorage(createKey(className));
            if(cache == undefined){
                cache = {};
            }
            classIndexCache[className] = cache;
        }
        if(newId){
            if(deleteId){
                delete cache[newId];
                $.localStorage(createKey(className), cache);
            } else{
                if(!cache[newId]){
                    cache[newId] = newId;
                    $.localStorage(createKey(className), cache);
                }
            }
        }
        return cache;
    }

    /*
    delete object
     */
    this.delete = function(obj){
        $.localStorage(createKey(obj.getClassName(),obj.getPK()), "");
        updateIndexCache(obj.getClassName(),obj.getPK(),true);
    }

    //only called by query function
    this.sendQuery = function(queryName, params){
        if(queryName == "*"){
            if(!params || params[0] == undefined){
                wprint("Ignoring query" + queryName + "Class name is the first param of a query");
                return;
            }
            var className = params[0];
            var cache = updateIndexCache(className);

            for(var v in cache){
                this.refresh(className);
            }
        }   else {
            wprint("Query in local storage is not implemented");
        }
        //Overwrite this function to send query events on server
    }

    //called ObjectRepository when an object with known PK should be loaded from server
    this.requestRefresh = function(className,pk){
        var jsonValue = $.localStorage(createKey(className,pk));
        var ret = JSON.parse(jsonValue);
        this.onServerObjectRefresh(className, ret);
    }

    //requested by ObjectRepository when an object can be changed
    this.saveObject = function(obj){
        $.localStorage(createKey(obj.getClassName(),obj.getPK()),obj);
        updateIndexCache(obj.getClassName(),obj.getPK());
    }
}

LocalPersistence.prototype = new BasePersistence();

BasePersistence.prototype.registerPersistence("local",new LocalPersistence());
