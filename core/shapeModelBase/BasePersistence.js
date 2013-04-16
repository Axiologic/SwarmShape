function ObjectChangeEvent(className, pk, chain, newValue, oldValue){
    this.type = SHAPEEVENTS.OBJECT_CHANGE;
    this.className = className;
    this.pk = pk;
    this.chain = chain;
    //newValue and oldValue are serialized
    this.newValue = newValue;
    this.oldValue = oldValue;
}

function BasePersistence(){
    var self = this;

    /**
     * Watch object for auto save
     * @param obj
     */
    this.register = function(obj){
        obj.on(SHAPEEVENTS.OBJECT_CHANGE, this.onObjectChange);
    }

    /**
     * apply a change event
     * it will call the setters that will be able
     * @param change : {type, chain, pk, newValue}
     */
    this.onRemoteObjectChange = function(change){
        var target = shape.lookup(change.type, change.pk);
        var chains = change.chain.split(".");
        for(var i=0;i<chains.length-1;i++){
            target = target[chains[i]];
        }
        target[chains[chains.length-1]] = change.newValue;
    }

    this.onRemoteDelete = function(deleteEvent){
        var target = shape.lookup(deleteEvent.type, deleteEvent.pk, false);
        if(target){
            shape.delete(target);
        }
    }

    this.onRefresh  = function(refreshEvent){
        //refreshObject contains an object.
        var target = shape.lookup(refreshEvent.type, refreshEvent.pk);
        var newValues = refreshEvent.values;
        this.defaultRefresh(target, newValues);
    }

    this.query = function(queryName, args){
        this.sendQuery(arguments[0],args);
    }

    //only called by shape.delete
    this.delete = function(obj){
        //Overwrite this function to send detele events on server
    }

    //only called by query function
    this.sendQuery = function(queryName,params){
        //Overwrite this function to send query events on server
    }

    //called only by ObjectRepository when an object with known PK is not cached on client
    this.refresh = function(className,pk){
        //Overwrite this function
    }

    this.onObjectChange = function(event){
        //Overwrite this function to send changes on server
    }
}

ShapeUtil.prototype.initPersistences = function(){

    var persistenceRegistry = {};

    BasePersistence.prototype.defaultRefresh = function(target, newValues){

        function generatePC1Level(host, newValues){
            var newVal;
            var oldInner = host.getInnerValues();
            var oldOuter = host.getOuterValues();

            for(var prop in newValues){
                newVal = newValues[prop];

                if(newVal==undefined){
                    var old = oldOuter[prop];
                    if(old!=undefined){
                        delete oldOuter[prop];
                        shapePubSub.pub(host, new PropertyChangeEvent(host, prop, undefined));
                    }else{
                        if(typeof newVal == "objects"){
                            if(oldOuter[prop]!=undefined){
                                generatePC1Level(oldOuter[prop], newValues[prop]);
                            }
                        } else {
                            if(newVal !== oldInner[prop]){
                                shapePubSub.pub(host, new PropertyChangeEvent(host, prop, newVal));
                            }
                        }
                    }
                }
            }
        }

        shapePubSub.blockCallBacks();
        generatePC1Level(target, newValues);
        target.__meta.innerValues = newValues;
        shapePubSub.releaseCallBacks();
    }

    BasePersistence.prototype.getPersistenceForClass = function(classDesc){
        var persistenceName = "default";
        if(classDesc.meta != undefined ){
            if(classDesc.meta.persitence != ""){
                persistenceName = classDesc.meta.persitence;
            }
        }
        var persistence = persistenceRegistry[persistenceName];
        if(!persistence){
            xprint("Can't find any persistence for class " + classDesc.className);
            return null;
        }
        return persistence;
    }

    BasePersistence.prototype.registerPersistence = function(type, persistence){
        persistenceRegistry[type] = persistence;
    }

    BasePersistence.prototype.remember = function(obj){
        wprint("Remember not implemented");
    }
}


