/*
    Code to handle shape models
    Each model will have a "className" found in __meta member (setMetaAttr, getMetaAttr)
    When a model is created, it get initialised and auto-computed members get prepared
 */


function QSClassDescription(declaration, qsName){
    var members = {};
    var expressions = {};
    var queries = {};
    var functions = {};
    this.className = qsName;

    for(var a in declaration){
       if(typeof declaration[a] === 'function'){
           functions[a] = declaration[a];
        }
        else
        if(declaration[a].type != undefined ){
            var m = declaration[a];
            members[a] = m;
        }
        else
            if(declaration[a].chains != undefined ){
                expressions[a] = declaration[a];
            }
         else if(declaration[a].lang != undefined ){
                queries[a] = declaration[a];
            }
    }

    this.attachClassDescription = function(model, ctorArgs){
        makeBindable(model);
        setMetaAttr(model,SHAPE.CLASS_NAME,this.className);

        var n;
        for(n in functions){
            model[n] =  functions[n].bind(model);
        }

        for(n in members){
            var m = members[n];
            try{
                model[n] = shape.newMember(m);
            }catch(err){
                wprint(err.message);
            }
            model.bindableProperty(n);
            //addChangeWatcher(model,n,changeCallBack)
        }

        if(model.ctor != undefined && typeof model.ctor == "function"){
            model.ctor.apply (model,ctorArgs);
        }

        function getTriggerFunction(targetChain,myTrigger,myProperty){
            return   function(){
                model[myProperty] = myTrigger.code.call(model);
                //console.log("Calling chain " + targetChain + " " + model[myProperty]+ " " + myProperty);
            }
        }

        for(n in expressions){
            var t = expressions[n];
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

    this.getFields = function(){
        var ret = {};
        for(var item in members){
            ret[item]=members[item];
        }
        for(var item in expressions){
            ret[item]=expressions[item];
        }
        return ret;
    }
}

function changeCallBack(){
    //do nothing until adding persistence
}

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

