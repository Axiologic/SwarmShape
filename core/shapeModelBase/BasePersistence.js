/**
 * mclass is the name (classname) of a model
 *  pk is the primary key of the object
 * if chain is "@" then the newValue is the whole object
 * if chain is "!" then is a request to delete this object
 * request is an identifier for a specific call. Can be used for getting new PKs for objects (autoinc ids)
 */

function PersistenceEvent(className, pk, chain, newValue, request) {
    this.mclass = className;
    this.pk = pk;
    this.chain = chain;
    this.newValue = newValue;
    this.request = request;
}

function BasePersistence() {
    var self = this;

    /**
     * apply a change event
     * it will call the setters that will be able
     * @param change : {className, chain, pk, newValue}
     */
    this.onRemotePersistenceEvent = function (change) {
        var target = shape.lookup(change.type, change.pk);
        var chains = change.chain.split(".");
        for (var i = 0; i < chains.length - 1; i++) {
            target = target[chains[i]];
        }
        target[chains[chains.length - 1]] = change.newValue;
    }

    this.onRemoteDelete = function (deleteEvent) {
        var target = shape.lookup(deleteEvent.type, deleteEvent.pk, false);
        if (target) {
            shape.delete(target);
        }
    }

    this.onRemoteRefresh = function (refreshEvent) {
        //refreshObject contains an object.
        var target = shape.lookup(refreshEvent.type, refreshEvent.pk);
        var newValues = refreshEvent.values;
        this.refresh(target, newValues);
    }

    this.query = function (queryName, args) {
        return this.sendQuery(queryName, args);
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

ShapeUtil.prototype.initPersistences = function () {

    var persistenceRegistry = {};

    /**
     *  From Object.identical github project
     * @param a
     * @param b
     * @param sortArrays
     * @returns {boolean}
     */
    ShapeUtil.prototype.identical = function (a, b, sortArrays) {
        function sort(object) {
            if (sortArrays === true && Array.isArray(object)) {
                return object.sort();
            }
            else if (typeof object !== "object" || object === null) {
                return object;
            }

            return Object.keys(object).sort().map(function (key) {
                return {
                    key: key,
                    value: sort(object[key])
                };
            });
        }

        var val1 = JSON.stringify(sort(a));
        var val2 = JSON.stringify(sort(b));
        return  val1 == val2;
    };


    /**
     * update target to new values
     * @param target
     * @param newValues
     */
    BasePersistence.prototype.server2local = function (target, newValues) {
        if(isString(newValues)){
            wprint("BasePersistence.prototype.server2local: second argument should be an object not a string. JSON.parse can help?");
            return;
        }

        function generatePC1Level(host, newValues) {
            var newVal, oldVal, oldOuterVal;
            var oldInner = host.getInnerValues();
            var oldOuter = host.getOuterValues();

            for (var prop in newValues) {
                newVal = newValues[prop];
                oldVal = oldInner[prop];
                oldOuterVal = oldOuter[prop];

                if (newVal == undefined) {
                    if (oldVal != undefined) {
                        delete oldOuter[prop];
                        shapePubSub.pub(host, new PropertyChangeEvent(host, prop, newVal));
                    }
                } else {
                    if (typeof newVal == "object") {
                        if (oldOuterVal == undefined) {
                            shapePubSub.pub(host, new PropertyChangeEvent(host, prop, newVal));
                        } else {
                            if (!ShapeUtil.prototype.identical(oldVal, newVal, false)) {
                                shapePubSub.pub(host, new PropertyChangeEvent(host, prop, newVal));
                                delete oldOuter[prop];
                            }
                        }
                    } else {
                        if (newVal !== oldVal) {
                            delete oldOuter[prop];
                            shapePubSub.pub(host, new PropertyChangeEvent(host, prop, newVal));
                        }
                    }
                }
            }

            for (var prop in oldOuter) {
                delete oldOuter[prop];
                shapePubSub.pub(host, new PropertyChangeEvent(host, prop, undefined));
            }
        }

        //TODO: patch newValues with existing ones
        shapePubSub.blockCallBacks();
        generatePC1Level(target, newValues);
        target.__meta.innerValues = newValues;


        var embedFields = target.getClassDescription().getEmbedFields();
        for(var emb in embedFields){
            if(newValues[emb]){
                var newEmbed =  shape.newEmbedded(embedFields[emb].type);
                BasePersistence.prototype.server2local(newEmbed,newValues[emb]);
                target[emb] = newEmbed;
            }
        }
        shapePubSub.releaseCallBacks();
    }

    Shape.prototype.server2local = BasePersistence.prototype.server2local;

    Shape.prototype.getPersistenceForClass = function (className) {
        var classDesc = shape.getClassDescription(className);
        var persistenceName = "null";
        if (classDesc.meta != undefined) {
            if (classDesc.meta.persitence != "") {
                persistenceName = classDesc.meta.persitence;
            }
        }
        var persistence = persistenceRegistry[persistenceName];
        if (!persistence) {
            xprint("Can't find persistence " + persistenceName + " for class " + classDesc.className);
            return null;
        }
        return persistence;
    }

    BasePersistence.prototype.registerPersistence = function (type, persistence) {
        persistenceRegistry[type] = persistence;
    }

    BasePersistence.prototype.getPersistenceByName = function (name) {
        return persistenceRegistry[name];
    }

    BasePersistence.prototype.remember = function (obj) {
        obj.on(SHAPEEVENTS.DOCUMENT_CHANGE, this.onLocalChange);
        //shapePubSub.sub(obj, this.onLocalChange)
    }

    //event is a DocumentChange event
    BasePersistence.prototype.onLocalChange = function (event) {
        if (event instanceof  DocumentChangeEvent) {
            var a = 0;
        }
    }
}


