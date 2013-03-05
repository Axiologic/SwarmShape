function ObjectRepository(className){
    var objectDictionary = {};

    this.lookup = function(pk, autocreate){
        var res= null;
        if(pk){
            res = objectDictionary[pk];
        }

        if(!res&&autocreate){
            res = BasePersistence.prototype.newRawObject(className);
        }

        if(!pk){
            objectDictionary[res.__meta.__localId] = res;
            //cerere id
            BasePersistence.prototype.getPersistence(shape.getClassDescription(className).persistence);
        }

        return res;
    }
}


ShapeUtil.prototype.initRepositories = function(){
    var persistentRepositories = {};
    var transientRepositories = {};

    /*
        pk - if null create a new object
        autocreate - defaut true
        transientScope - default false
     */
    function lookup (className, pk, autocreate, transientScope, args){
        var res = null;
        var repo;
        var isTransient = (transientScope==undefined || transientScope==true);
        if(isTransient){
            repo = transientRepositories[className];
            if(repo==undefined){
                repo = new ObjectRepository(className);
                transientRepositories[className] = repo;
            }
        } else {
            repo = persistentRepositories[className];
            if(repo==undefined){
                repo = new ObjectRepository(className);
                persistentRepositories[className] = repo;
            }
        }

        if(pk){
            res = repo[pk];
        } else {
            res =  Shape.prototype.newRawObject(className,args);
            repo[res.__meta.pk] = res.__meta.pk;
        }

        if(!res && (autocreate == undefined || autocreate == true)){
            res =  Shape.prototype.newRawObject(className,args);
            repo[pk] = res.__meta.pk;
        }

        if(!isTransient){
            BasePersistence.prototype.remember(res);
        }
        return res;
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
        return lookup(typeName, pk, false, false, args);
    }

    Shape.prototype.delete = function(){

    }

    Shape.prototype.newRawObject = function(className, args){
        var res;

        shapePubSub.blockCallBacks();

        try{
            var desc = shape.getClassDescription(className);
            var callFunc = shape.getTypeBuilder(className).initializer;
            if(callFunc){
                res = callFunc(desc, args);
            } else {
                wprint("Can't create object with type " + className);
            }
        } catch(err){
            dprint(err);
            wprint("Creating object (or Ctor code) failed for " + className);
        }
        shapePubSub.releaseCallBacks();
        return res;
    }
}
