function queryView(className){
    makeBindable(this);
    this.__meta.bindableCollection = true;
    this.container = [];
    this.length = this.container.length;
    setMetaAttr(this, SHAPE.CLASS_DESCRIPTION, shape.getClassDescription(SHAPE.QUERY_VIEW));
    makeEventEmitter(this);

    this.query = function (queryName){
        var args = shapeUtil.mkArgs(arguments,1);
        var persistence = shape.getPersistenceForClass(className);
        this.container = [];
        var queryUID = persistence.query(queryName, args);
        persistence.on("update", function(obj){
            var metaInQuery = getMetaAttr(obj,"inQuery");
            if(metaInQuery[queryUID] == queryUID ){
                this.push(obj);
            }
        });

        persistence.on("end",function(){
           this.emit("end",queryUID);
        });
    return queryUID;
    }
}

queryView.prototype = Collection.prototype;

shape.registerModel(SHAPE.QUERY_VIEW, {
    length : {
        type : "int"
    }
},true);
