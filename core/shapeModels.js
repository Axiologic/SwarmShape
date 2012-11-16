
var classRegistry = {};
function QSClassDescription(declaration, qsName)){
    members = {};
    triggers = {};
    queries = {};
    functions = {};
    this.className = qsName;
    for(var a in declaration){
       if(typeof declaration[a] === 'function'){
           this.functions[a] = declaration[a];
        }
        else
        if(declaration[a].type != undefined ){
            this.members[a] = declaration[a];
        }
        else
            if(declaration[a].chains != undefined ){
                this.triggers[a] = declaration[a];
            }
         else if(declaration[a].lang != undefined ){
                this.queries[a] = declaration[a];
            }
    }

    this.attachClassDescription = function(model,classDescription){
        youAreCool(model);
        if(model.__meta.classDescription == undefined){
            model.__meta.classDescription = classDescription;
        }
        var n;
        for(n in functions){
            model[n] =  functions[n].bind(model);
        }

        for(n in triggers){
            var t = triggers[n];
            var chains = t.chains.split(",");
            for(var i=0; i<chains.length; i++){
                addChangeWatcher(model,chains[i],function(){
                    model[n] = t.code();
                });
            }
        }
    }


    this.update(objId, newValues){

    }
}

registerModel = function(modelName,declaration){
    classRegistry[modelName] = new QSClassDescription(declaration);
}

var dataRegistries = {};

function DataRegistry(name){
    this.name       = name;
    this.dict       = {};

    this.lookup(objId){
        var o = this.dict[objId];
        if(o == undefined){
            this.dict[objId] = objId;
        }
    }
}

