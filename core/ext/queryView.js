
var globalQueryViewInstanceCounter = 0;

function QueryView(className){
    makeBindable(this);
    this.__meta.bindableCollection = true;
    this.container = [];
    this.length = this.container.length;
    setMetaAttr(this, SHAPE.CLASS_DESCRIPTION, shape.getClassDescription(SHAPE.QUERY_VIEW));
    makeEventEmitter(this);

    this.query = function (queryName){
        globalQueryViewInstanceCounter++;
        var queryUid = "QueryView"+globalQueryViewInstanceCounter;
        var args = ShapeUtil.prototype.mkArgs(arguments,1);
        var persistence = shape.getPersistenceForClass(className);
        this.container = [];
        var queryUID = persistence.query(queryName, args,queryUid );
        var self = this;

        shapePubSub.sub(queryUid, function(obj){
            if(obj == "end"){
                this.emit("end",queryUID);
            } else{
                self.push(obj);
            }
        });
    return queryUID;
    }
}

QueryView.prototype = Collection.prototype;

shape.registerModel(SHAPE.QUERY_VIEW, {
    length : {
        type : "int"
    }
},true);
