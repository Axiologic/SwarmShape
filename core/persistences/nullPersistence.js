function LocalPersistence(){
    /*
     delete object
     */
    this.delete = function(obj){

    }

    //only called by query function
    this.sendQuery = function(queryName, params){
        wprint("Query in null persistence is not implemented");
        return 0;
    }

    //called by ObjectRepository when an object with known PK should be loaded from server
    this.requestRefresh = function(className,pk){
        //do nothing
    }
    //requested by ObjectRepository when an object can be changed
    this.saveObject = function(obj){
        //do nothing
    }
}

LocalPersistence.prototype = new BasePersistence();
BasePersistence.prototype.registerPersistence("null",new LocalPersistence());
