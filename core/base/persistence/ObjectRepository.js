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



function initRepositories(){
    var persistentRepositories = {};
    var transientRepositories = {};


    /*
        pk - if null create a new object
        autocreate - defaut true
        transientScope - default false
     */
    shape.prototype.lookup = function(className, pk, autocreate, transientScope){
        if(transientScope==undefined||transientScope==true){
            var repo = transientRepositories[className];
            var res = null;

            if(repo==undefined){
                transientRepositories[className] =
                repo = transientRepositories[className];
            }

            if(pk){
                res = repo[pk];
            }else{
                res = BasePersistence.prototype.newRawObject(className);
                //continuare cere id
                return res;
            }

            if(!res&&(autocreate==undefined||autocreate==true)){
                res = BasePersistence.prototype.newRawObject(className);
                res[res.__meta.pk]=pk;
                return res;
            }


        }
    }


}
