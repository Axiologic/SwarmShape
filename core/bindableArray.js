
//nothing

var changeCounter = 0;

youAreBindableArray = function(arr){
    youAreBindable(arr);

    arr.__notifyChange = function(){
        changeCounter++;
        arr.onChange = changeCounter;
        console.log("Awake onChange " + arr);
    };

    arr.toString = function(){
        return "array:"+this.__meta.__localId;
    }

    console.log("Bindable Array " + arr);
    arr.__notifyChange();
}


addArrayChangeWatcher = function(arr,callBack){
    addChangeWatcher(arr,"onChange",callBack);
}


