

var classRegistry = {};
function QSClassDescription(declaration, qsName){
    var members = {};
    var triggers = {};
    var queries = {};
    var functions = {};
    this.className = qsName;
    for(var a in declaration){
       if(typeof declaration[a] === 'function'){
           functions[a] = declaration[a];
        }
        else
        if(declaration[a].type != undefined ){
            members[a] = declaration[a];
        }
        else
            if(declaration[a].chains != undefined ){
                triggers[a] = declaration[a];
            }
         else if(declaration[a].lang != undefined ){
                queries[a] = declaration[a];
            }
    }

    this.attachClassDescription = function(model){
        makeBindable(model);
        setMetaAttr(model,"className",this.className);

        var n;
        for(n in functions){
            model[n] =  functions[n].bind(model);
        }

        for(n in members){
            var m = members[n];
            if(m.value != undefined){
                if(m.value == "null"){
                    model[n] = null;
                }
                else {
                    model[n] = m.value;
                }
            } else
              if(m.type == "int"){
                  model[n] = 0;
              } else  if(m.type == "string"){
                  model[n] = "";
              } else if(m.type == "boolean"){
                    model[n] = false;
                }
                else if(m.type == "collection"){
                model[n] = new Collection();
                }
                else {
                model[n] = newObject(m.type);
                }
            addChangeWatcher(model,n,changeCallBack)
        }

        if(model.ctor != undefined && typeof model.ctor == "function"){
            model.ctor();
        }

        function getTriggerFunction(targetChain,myTrigger,myProperty){
            return   function(){
                model[myProperty] = myTrigger.code.call(model);
                //console.log("Calling chain " + targetChain + " " + model[myProperty]+ " " + myProperty);
            }
        }

        for(n in triggers){
            var t = triggers[n];
            //console.log("Preparing trigger " + n);
            var chains = t.chains.split(",");
            for(var i=0; i<chains.length; i++){
                addChangeWatcher(model,chains[i],getTriggerFunction(chains[i],t,n));
            }
        }
    }

    this.update = function(objId, newValues){
    //TODO: update from external sources
    }
}

function changeCallBack(){
    //do nothing until adding persistence
}

registerModel = function(modelName,declaration){
    classRegistry[modelName] = new QSClassDescription(declaration,modelName);
}

var dataRegistries = {};

function DataRegistry(name){
    this.name       = name;
    this.dict       = {};

    this.lookup = function(objId){
        var o = this.dict[objId];
        if(o == undefined){
            this.dict[objId] = objId;
        }
    }
}

newObject = function(className){
    var res = {};
    var qsClass = classRegistry[className];
    if(qsClass != undefined){
    qsClass.attachClassDescription(res);
    }
    else{
        wprint("Undefined class " + className);
    }
    return res;
}

newTransientObject = function(className){
    var res = newObject(className);
    setMetaAttr(res,"persistence", "transient");
    return res;
}

newPersistentObject = function(className){
    var res = newObject(className);
    //TODO: add in dataRegistries
    setMetaAttr(res,"persistence", "global");
    return res;
}
