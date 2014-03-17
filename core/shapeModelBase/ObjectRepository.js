ShapeUtil.prototype.initRepositories = function(){
    var persistentRepositories = {};
    var transientRepositories = {};

    function getRepository(className, isTransient){
       var repo;
        if(isTransient){
            repo = transientRepositories[className];
            if(repo == undefined){
                repo = new ObjectRepository(className);
                transientRepositories[className] = repo;
            }
        } else {
            repo = persistentRepositories[className];
            if(repo == undefined){
                repo = new ObjectRepository(className);
                persistentRepositories[className] = repo;
            }
        }
       return repo;
    }
    /*
        pk - if null create a new object
        autocreate - default true
        transientScope - default false
     */
    function lookup (className, pk, autocreate, transientScope, args){
        var res = null;
        var repo;
        function createNewObject(){
            res =  Shape.prototype.newRawObject(className,args);
            if(pk == undefined){
                pk = res.getPK();
            } else{
                res.setPK(pk);
            }
        }

        var isTransient = (transientScope==undefined || transientScope==true);
        repo = getRepository( className, isTransient);


        if(pk){
            res = repo[pk];
        } else {
           createNewObject(); // assign in res
           repo[pk] = res;
           repo.persistence.remember(res);
           res.__meta.transient = isTransient;
        }

        if(!res && (autocreate == undefined || autocreate == true)){
            createNewObject(); // assign in res  and pk
            repo[pk] = res;
            repo.persistence.remember(res);
            res.__meta.transient = isTransient;
        }
        return res;
    }


    Shape.prototype.newEmbedded = function(typeName){
        var args = ShapeUtil.prototype.mkArgs(arguments,1);
        return lookup(typeName, null, true, true, args);
    }

    Shape.prototype.newEntity = function(typeName){
        var args = ShapeUtil.prototype.mkArgs(arguments,1);
        return lookup(typeName, null, true, false, args);
    }

    Shape.prototype.newTransient = function(typeName){
        var args = ShapeUtil.prototype.mkArgs(arguments,1);
        return lookup(typeName, null, true, true, args);
    }

    Shape.prototype.lookup = function(typeName, pk){
        if(!pk){
            wprint("shape.lookup was used with an undefined Primary Key. Use newEntity instead!");
        }
        var args = ShapeUtil.prototype.mkArgs(arguments,2);
        return lookup(typeName, pk, true, false, args);
    }

    /**
     *
     * @param obj
     */
    Shape.prototype.delete = function(obj){
        var repo = getRepository(obj.getClassName(), obj.__meta.transient);
        delete repo[obj.getPK()];
    }

    /**
     *
     * @param obj
     * @param oldPK
     */
    Shape.prototype.renamePK = function(obj, oldPK){
        var repo = getRepository(obj.getClassName(), obj.__meta.transient);
        repo[obj.getPK()] = obj;
        delete repo[oldPK];
    }

    /**
     * Create an object froma model tmeplate but it is not registered anywhere
     * @param className
     * @param args
     * @returns {*}
     */
    Shape.prototype.newRawObject = function(className, args,memberDesc,owner){
        var res;
        shapePubSub.blockCallBacks();
        try{
            var callFunc = shape.getTypeBuilder(className).factory;
            if(callFunc){
                res = callFunc(className, args, memberDesc, owner);
                res.__meta.encodeFunction = shape.getTypeBuilder(className).encode;
            } else {
                wprint("Can't create object with type " + className);
            }
        } catch(err){
            eprint("Creating object (or Ctor code) failed for " + className +"\n>>>Err:", err);
        }
        shapePubSub.releaseCallBacks();
        return res;
    }

    /**
     *
     * @param className
     * @param persistenceName
     */
    Shape.prototype.setPersistenceForClass  = function(className, persistenceName){
        var repo = getRepository(className, false);
        repo.setPersistence(persistenceName);
    }
}

function ObjectRepository(className){
    try{
        this.persistence = shape.getPersistenceForClass(className);
        if(this.persistence == null){
            wprint("No persistence for " + className);
        }
        this.getClassName = function(){
            return className;
        }
    } catch(err){
        wprint("Invalid class description for " + className + " " + err);
    }
}

ObjectRepository.prototype.setPersistence = function(persistenceName){
    var pers = BasePersistence.prototype.getPersistenceByName(persistenceName);
    if(pers == null){
        pers = BasePersistence.prototype.getPersistenceByName("null");
        wprint("Unknown persistence " + persistenceName + " defaulting to 'null' persistence");
    }
    this.persistence = pers;
}