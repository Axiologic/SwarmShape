function queryView(className){
    Collection.prototype.superInit(this);
    setMetaAttr(myThis, SHAPE.CLASS_DESCRIPTION, shape.getClassDescription(SHAPE.QUERY_VIEW));
    makeEventEmitter(this);
    this.query = function (queryName){
        var args = shapeUtil.mkArgs(arguments,1);
        var pers = shape.getPersistenceForClass(className);
        pers.query(queryName, args);
        pers.on("update")
    }
}

queryView.prototype = Collection.prototype;

shape.registerModel(SHAPE.QUERY_VIEW, {
    length : {
        type : "int"
    }
},true);