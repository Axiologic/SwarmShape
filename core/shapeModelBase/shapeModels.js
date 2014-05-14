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
    var meta;
    this.className = qsName;

    for(var a in declaration){
        if(a == "meta"){
            meta = declaration[a];
        } else
       if(typeof declaration[a] === 'function'){
           functions[a] = declaration[a];
        }
        else
        if(declaration[a].chains != undefined ){
            expressions[a] = declaration[a];
        }
        else
        if(declaration[a].type != undefined ){
            var m = declaration[a];
            members[a] = m;
        }
         else if(declaration[a].lang != undefined ){
                queries[a] = declaration[a];
            }
    }

    this.getPkFieldName = function(){
        if(meta){
            return meta.pk;
        }
        return undefined;
    }


    function newMember (memberDesc){
        var res;
        var typeName = memberDesc.type;
        if(memberDesc.embed){
            typeName = "EmbeddedObject";
        }

        var callFunc = shape.getTypeBuilder(typeName).initializer;
        if(callFunc){
            res = callFunc(memberDesc.type,undefined, memberDesc );
        }else{
            wprint("Can't create object with type "+ memberDesc.type);
        }
        return res;
    }


    this.attachClassDescription = function(model, ctorArgs, owner){
        makeBindable(model);
        setMetaAttr(model,SHAPE.CLASS_DESCRIPTION ,this);
        model.__meta.owner = owner;

        var n;
        for(n in functions){
            model[n] =  functions[n].bind(model);
        }

        for(n in members){
            var m = members[n];
            model.bindableProperty(n);
            try{
                model[n] = newMember(m);
            }catch(err){
                eprint("Error while initialising member " ,n, " in a model with type " + this.className, err);
            }
            //addChangeWatcher(model,n,changeCallBack)
        }

        try{
            if(model.ctor != undefined && typeof model.ctor == "function"){
                model.ctor.apply (model,ctorArgs);
            }
        } catch(err){
            wprint("ctor code unknown error for "+  this.className, err.message);
        }



        function getTriggerFunction(targetChain,myTrigger,myProperty, chain){
            return   function(newParent,property,newValue, chain){
                try{
                    if(model){
                        model[myProperty] = myTrigger.code.call(model, chain);
                    }
                    else {
                        wprint("Calling chain with null model ");
                    }
                } catch(err){
                    eprint("Unknown error in trigger code:\n"+ myTrigger.code, err);
                }
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

    this.getEmbedFields = function(){
        var ret = {};
        for(var item in members){
            if(members[item].embed){
                ret[item] = members[item];
            }
        }
        return ret;
    }

    this.getMemberDescription = function(memberName){
        if(members[memberName]==undefined && expressions[memberName] == undefined ){
            wprint("Unknown member " + memberName + " in class " + this.className);
        } else {
            if(expressions[memberName] != undefined ){
                return expressions[memberName];
            }
            return members[memberName];
        }
        return null;
    }

    /*
    this.updateMemberValue = function(target,prop,value){
        if(this.isTransientMember(prop)){
            target.getTransientValues()[prop] = value;
        }
        var member = this.getMemberDescription(prop);
        if(member){
            var f = shape.getTypeBuilder(member.type).encode;
            var ev;
            if(f){
                ev = f(value);
            }   else{
                ev = value;
            }
            if(member.transient){
                target.getTransientValues()[prop] = value;
            } else {
                target.getOuterValues()[prop] = value;
            }
        }
    } */

    /*
    this.isOuterKindMember = function(memberName){
        var memDesc = this.getMemberDescription(memberName);
        if(memDesc.isTransientMember()){
            return true;
        }
        var res = shape.getClassDescription(memDesc.type, true);
        if(res==undefined){
            return false;
        }else{
            return true;
        }
    }

    this.createOuterMember = function(memberName, innerValues){
        var memDesc = this.getMemberDescription(memberName);
        if(memDesc.isTransientMember()){
            return shape.newTransient()
        }
    }     */

    this.isTransientMember = function(memberName){
        if(expressions[memberName]){
            return true;
        }
        var member = members[memberName];
        if(member && member.transient){
            return true;
        }
        return false;
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


ShapeUtil.prototype.initSchemaSupport = function(){
    var classRegistry = {};
    var interfaceRegistry = {};
    var typeBuilderRegistry = {};


    Shape.prototype.registerModel = function(modelName,declaration){
        var desc = new QSClassDescription(declaration,modelName);
        classRegistry[modelName] = desc;

        if(this.getTypeBuilder(modelName) == undefined) {
            if(desc.meta == undefined || desc.meta.persistence != "embed"){
                //global object (entity)
                //cprint("Registering " + modelName + " as GlobalObject");
                this.registerTypeBuilder(modelName, this.getTypeBuilder("GlobalObject"));
            }
            else {
                //embeddable object
                this.registerTypeBuilder(modelName, this.getTypeBuilder("EmbeddedObject"));
            }
        }
    }


    Shape.prototype.registerInterface = function(interfaceName, declaration){
        interfaceRegistry[interfaceName] = new InterfaceDescription(declaration,interfaceName);
        /* Because interfaces shouldn't be instantiated we return null every time from build function. */
        this.registerTypeBuilder(interfaceName, {initializer:function(){ return null}});
    }

    Shape.prototype.registerTypeBuilder = function(typeName, typeDescription){
        if(typeBuilderRegistry[typeName]){
            wprint("Shouldn't have more than one entry for "+typeName+" !");
        }
        typeBuilderRegistry[typeName] = typeDescription;
    }

    Shape.prototype.getTypeBuilder = function(typeName){
        return typeBuilderRegistry[typeName];
    }

    Shape.prototype.getClassDescription = function(modelName, ignoreWarning){
        var ret = classRegistry[modelName];
        if(ignoreWarning == undefined && !ret){
            wprint("Undefined class " + modelName);
        }
        return ret;
    }

    Shape.prototype.getInterfaceDescription = function(modelName){
        return interfaceRegistry[modelName];
    }

    Shape.prototype.verifyObjectAgainstInterface = function (object, propertyName, newValue){
        var csdsc = object.getClassDescription();
        if(!csdsc){
            wprint("Warning:" + " unchecked assignment of property " + propertyName);
            return false;
        }

        var modelFields = csdsc.getFields();
        var newValueDesc = modelFields[propertyName];
        if(this.getInterfaceDescription(newValueDesc['type'])){
            if(!this.getInterfaceDescription(newValueDesc['type']).implementsYou(newValue)){
                wprint("You are trying to assign wrong type of object! Should implement interface " + newValueDesc['type']);
                return false;
            }
        }
        return true;
    }


    /**
     *
     * Method used to check if chain members ar described in shape's models description.
     * Returns misspelled chain link or null if the chain is ok.
     *
     * */
    Shape.prototype.checkChain = function(model, chain){
        var chainItems = chain.split(".");
        if(chain==""){
            wprint("Chain can't be empty!");
            return "";
        }
        var classDesc = model.getClassDescription();
        for(var i=0; i<chainItems.length; i++){
            if(classDesc){
                var m = classDesc.getFields()[chainItems[i]];
                if(!m){
                    return chainItems[i];
                }else{
                    classDesc = shape.getClassDescription(m.type, true);
                    //when finding a basic object type in chain we stop checking
                    if(m.type=="object"){
                        break;
                    }
                }
            }else{
                var interfaceDesc = shape.getInterfaceDescription(m.type);
                //if an Interface is found in chain, stop checking
                if(interfaceDesc){
                    break;
                }
                return chainItems[i];
            }
        }
        return null;
    }

    Shape.prototype.isChainExpression = function(expression){
        var result = expression.match(/^((?:[^\W]+\.{1})*[^\W]*)$/);
        // console.log("expression "+expression+" result "+result);
        if(result!=null){
            return true;
        }
        return false;
    }

}

lprint("Initialising Shape models...");



