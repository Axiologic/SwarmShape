
/**
 * mclass is the name (classname) of a model
 *  pk is the primary key of the object
 * if chain is "@" then the newValue is the whole object
 * if chain is "!" then is a request to delete this object
 * request is an identifier for a specific call. Can be used for getting new PKs for objects (autoinc ids)
 */

function PersistenceEvent(className, pk, chain, newValue, request){
       this.mclass      = className;
       this.pk          = pk;
       this.chain       = chain;
       this.newValue    = newValue;
       this.request     = request;
}

function BasePersistence(){
    var self = this;

     /**
     * apply a change event
     * it will call the setters that will be able
     * @param change : {className, chain, pk, newValue}
     */
    this.onRemotePersistenceEvent = function(change){
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

    this.onRemoteRefresh  = function(refreshEvent){
        //refreshObject contains an object.
        var target = shape.lookup(refreshEvent.type, refreshEvent.pk);
        var newValues = refreshEvent.values;
        this.refresh(target, newValues);
    }

    this.query = function(queryName, args){
        return this.sendQuery(queryName,args);
    }

    /*
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
    } */
}

ShapeUtil.prototype.initPersistences = function(){

    var persistenceRegistry = {};

    /**
     * update target to new values
     * @param target
     * @param newValues
     */
    BasePersistence.prototype.server2local = function(target, newValues){
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

    Shape.prototype.getPersistenceForClass = function(className){
        var csdsc = shape.getClassDescription(className);
        var persistenceName = "NULL";
        if(csdsc.meta != undefined ){
            if(csdsc.meta.persitence != ""){
                persistenceName = classDesc.meta.persitence;
            }
        }
        var persistence = persistenceRegistry[persistenceName];
        if(!persistence){
            xprint("Can't find persistence " + persistenceName + " for class " + csdsc.className);
            return null;
        }
        return persistence;
    }

    BasePersistence.prototype.registerPersistence = function(type, persistence){
        persistenceRegistry[type] = persistence;
    }

    BasePersistence.prototype.getPersistenceByName = function(name){
        return persistenceRegistry[name];
    }

    BasePersistence.prototype.remember = function(obj){
        obj.on(SHAPEEVENTS.DOCUMENT_CHANGE,this.onLocalChange);
    }

    //event is a DocumentChange event
    BasePersistence.prototype.onLocalChange = function(event){

    }
}


