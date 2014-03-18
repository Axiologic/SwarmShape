
function ModelObject(type,args, owner, isEmbedded){
    var desc = shape.getClassDescription(type);
    if(!isEmbedded){
        isEmbedded = false;
    }
    this.isEmbededObject = isEmbedded;
    this.repository = {};
    try{
        if(!owner){
            owner = this;
        }
        desc.attachClassDescription(this, args, owner);
    } catch(err) {
        eprint("Unknown instantiating a new object with type " + type, err);
    }
    this.__meta.pk = "temporary:" + this.__meta.__localId;
    return this;
}

ModelObject.prototype.makeEmbedded = function(owner){
    this.isEmbededObject = true;
}

ModelObject.prototype.createMember = function(memberName){
    try{
        var args = ShapeUtil.prototype.mkArgs(arguments,1);
        var classDesc   = this.getClassDescription();
        var memberDesc  = classDesc.getMemberDescription(memberName);
        var res = shape.newRawObject(memberDesc.type, args, memberDesc, this.__meta.owner);
        this[memberName] = res;
    } catch(err){
        eprint("Failed to create member " + memberName + " " ,  err );
    }
}

ModelObject.prototype.newObject = function(typeName){
    var args = ShapeUtil.prototype.mkArgs(arguments,1);
    return shape.newRawObject(typeName,args,null,this.__meta.owner);
}

ModelObject.prototype.lookup = function(type, key){

}

ModelObject.prototype.setDirectOwner = function(owner, property){
    if(this.isEmbededObject){
        if(this.__meta.owner == undefined){
            this.__meta.directOwner             = owner;
            this.__meta.directOwnerProperty     = property;
            var myOwner = owner;
            while(myOwner != myOwner.__meta.owner){
                myOwner = myOwner.__meta.directOwner;
            }
            owner.__meta.innerValues[property] = this.__meta.innerValues;
            this.__meta.owner = myOwner;
        } else{
            //wprint("It is wrong to assign an embedded object as persistent member of another object!");
        }
    } else {
        //do nothing
    }
}
