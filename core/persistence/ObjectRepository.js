function ObjectRepository(className){
    this.getClassName = function(){
        return className;
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
        function createNewObject(){
            res =  Shape.prototype.newRawObject(className,args);
            if(pk == undefined){
                pk = res.getPK();
            } else{
                res.setPK(pk);
            }
        }

        var isTransient = (transientScope==undefined || transientScope==true);
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

        if(pk){
            res = repo[pk];
        } else {
           createNewObject(); // assign in res
           repo[pk] = res;
        }

        if(!res && (autocreate == undefined || autocreate == true)){
            createNewObject(); // assign in res  and pk
            repo[pk] = res;
        }

        if(!isTransient && res){
            var csdsc = res.getClassDescription();
            var pers = BasePersistence.prototype.getPersistenceForClass(csdsc);
            if(pers){
                pers.remember(res);
            }
        }
        return res;
    }

    Shape.prototype.newEmbedded = function(className){
        var args = ShapeUtil.prototype.mkArgs(arguments,1);
        var res =  Shape.prototype.newRawObject(className,args);
        res.__meta.pk = "l://"+res.__meta.__localId;
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
        return lookup(typeName, pk, true, false, args);
    }

    Shape.prototype.delete = function(){

    }

    Shape.prototype.newRawObject = function(className, args){
        var res;

        shapePubSub.blockCallBacks();

        try{
            var callFunc = shape.getTypeBuilder(className).initializer;
            if(callFunc){
                res = callFunc(className, undefined, args);
            } else {
                wprint("Can't create object with type " + className);
            }
        } catch(err){
            eprint("Creating object (or Ctor code) failed for " + className +"\n>>>Err:", err);
        }
        res.__meta.pk = "local:" + res.__meta.__localId;
        shapePubSub.releaseCallBacks();
        return res;
    }
}
