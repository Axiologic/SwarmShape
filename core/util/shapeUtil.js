/*
    Utilities:
    J - returns a JSON from an object

    cprint // print messages in the java script console
    wprint // print warnings (log!?)
    dprint  // a print debug messages (remove those in release)
 */

//TODO: move more utility classes here
function ShapeUtil(){

}


//pretty print for bindable objects, donn't print __meta stuff
J = function(obj) {
    var tmpObj={};
    for(var v in obj) {
        if(v != "__meta"){
            tmpObj[v] = obj[v];
        }
    }
    return JSON.stringify(tmpObj);
}

window.onerror = function(message, filename, lineno, colno, error){

    if(error != null){
        alert(message + error.stack);
        dprint(message, filename, lineno, colno, error);
        eprint("global error", error);
        //handle the error with stacktrace in error.stack
    }
    else{
        lprint(message, filename, lineno);
        //sadly only 'message', 'filename' and 'lineno' work here
    }
};


$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {

    // This is the default error handler for ajax request.

    // Extract all the information required to understand.
    var requestResponse = {
        url: ajaxSettings.url,
        method: ajaxSettings.type,
        data: ajaxSettings.data,
        httpStatus: jqXHR.status,
        error: thrownError || jqXHR.statusText,
        data: ajaxSettings.data
    };

        // Notify the user so he might not wonder.
    lprint('Something went wrong with an loading ', J(requestResponse));

});


function fragmentToObject(fragment){
    fragment = decodeURI(fragment);

    var params = fragment.split("/");
    var obj={};

    for(var i=0; i<params.length; i+=2){
        if(params[i]==""){
            break;
        }
        obj[params[i]]=params[i+1].replace("/%2f/g", "/");
    }
    return obj;
}

function objectToFragment(obj){
    var frag = "";
    for(var prop in obj){
        frag+=prop+"/"+obj[prop].replace("/\//g","%2f")+"/";
    }
    return encodeURI(frag);
}


ShapeUtil.prototype.initUtil = function(){
    ShapeUtil.prototype.mkArgs = function(myArguments, from){
        if(!from){
            from = 0;
        }

        if(myArguments.length <= from){
            return null;
        }
        var args = [];
        for(var i = from; i<myArguments.length;i++){
            args.push(myArguments[i]);
        }
        return args;
    }
}

ShapeUtil.prototype.getType = function(object){
    return (object["getClassName"])?object.getClassName():typeof object;
}


function Html5LocalStorage(key, value){
     var ret;
    if(value != undefined){
        if(typeof value != "string"){
            ret = value;
            try{
                value = JSON.stringify(value);
            } catch(err){
                console.log("Err" + err + " From:" + ret);
                value = "";
            }
        }
       localStorage.setItem(key,value);
    } else{
        ret = localStorage.getItem(key);
        try{
            if(ret){
                ret = JSON.parse(ret);
            }
        } catch(err){
            console.log("Err" + err + " From:" + ret);
        }
    }
    return ret;
}


function PropertiesFence(context, properties, callback){
    var self                    = this;
    var duringCallback         = false;
    var refreshDuringCallback  = false;
    var callLevel = 0;

    function getShapeSafeValue(o){
        if(o && o.__meta){
            if(o.__meta.changeIdentityCounter){
                return o.__meta.__localId + o.__meta.changeIdentityCounter;
            }
           return o.__meta.__localId;
        }
        return o;
    }

    function saveValues(){
        for(var i=0;i<properties.length;i++){
            self[properties[i]] = getShapeSafeValue(context[properties[i]]);
        }
    }

    function valuesChanged(){
        for(var i=0;i<properties.length;i++){
            var o1 = getShapeSafeValue(self[properties[i]]);
            var o2 = getShapeSafeValue(context[properties[i]]);

            if( o1 !== o2) {
                return true;
            }
        }
        return false;
    }


    this.acquire = function (){
        fuckingCallLevel++;
        if(fuckingCallLevel >100){
            fuckingCallLevel--;
            return;
        }
        if(valuesChanged()){
            if(duringCallback){
                refreshDuringCallback = true;
            } else{
                duringCallback = true;
                saveValues();
                try{
                    callback();
                } catch(err){
                    console.log("Fence error:");
                    console.log(err);
                }
                duringCallback = false;
                if(refreshDuringCallback){
                    refreshDuringCallback = false;
                    self.acquire();
                }
            }
        }
        fuckingCallLevel--;
    }
}

fuckingCallLevel = 0;


var counterUUID = 0;
function generateShapeUUID(){
    counterUUID++;
    return "SHAPE_UUID_" + counterUUID;
}


function isString(s) {
    return typeof(s) === 'string' || s instanceof String;
}


function parseInt0(v){
    if(!v) return 0;
     var nv = parseInt(v);
    if(isNaN(nv)){
        return 0;
    }
    return nv;
}


function encode_b64(s){
  return window.btoa(s);
}


function decode_b64(s){
    try{
        return window.atob(s);
    } catch(err){
        return "";
    }
}

ShapeUtil.prototype.executionQueue = new TaskPriorityQueue();

//ShapeUtil.prototype.messageChannel =    new MessageChannel();

askExecution = function(){
    //ShapeUtil.prototype.messageChannel.postMessage(cb);
    setTimeout(doExecution,0);
}

function doExecution(){
    var cb = ShapeUtil.prototype.executionQueue.dequeue();
    if(cb){
        cb();
        var cb = ShapeUtil.prototype.executionQueue.peek();
        if(cb){
            askExecution();
        }
    }
}

//ShapeUtil.prototype.messageChannel.onmessage = doExecution;

ShapeUtil.prototype.executeNext = function(callBack, priority, length){
    ShapeUtil.prototype.executionQueue.enqueue(callBack, priority);
    if(ShapeUtil.prototype.executionQueue.length() == 1){
        askExecution();
    }
}


lprint("Initialising ShapeUtil...");
