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


function cprint(){
    var str = dumpArgs(arguments);
    console.log(str);
    ShapeUtil.prototype.bufferConsole(str);
}

function dprint(){
    var str =   dumpArgs(arguments);
    shape__linePrint("Debug:",str);
}

function lprint(){
    var str =   dumpArgs(arguments);
    shape__linePrint("Log:",str, null, true);
}

function wprint (){
    shape__linePrint("Warning:",dumpArgs(arguments));
}

function esprint(str, err){
    if(err){
        shape__linePrint("Error:", str + " : "+err.message,err.stack);
    } else {
        shape__linePrint("Error:", str);
    }
}

function eprint(str, err){
    if(err){
        shape__linePrint("Error:", str + " : " + err.message, err.stack);
    } else {
        shape__linePrint("Error:", str);
    }
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

//internal stuff
var shape__linePrint_hasConsole = typeof console; // for IE...

ShapeUtil.prototype.bigBuffer = [];
ShapeUtil.prototype.bufferConsole = function(){
    var line = "";
    for(var i=0;i<arguments.length;i++){
        line += " ";
        line += arguments[i];
    }

    if(ShapeUtil.prototype.haveDebugConsole != false){
        ShapeUtil.prototype.bigBuffer.push(line);
    }

}

if (!shape__linePrint_hasConsole  || !console || !console.log || !console.error) {
    console = {log: ShapeUtil.prototype.bufferConsole, error: ShapeUtil.prototype.bufferConsole};
}

function shape__linePrint(prefix, text, fullStack, noConsole){
    var text = shape__prettyStack(fullStack,3)+'>>'+text;

    ShapeUtil.prototype.bufferConsole(prefix + text);
    if(shape__linePrint_hasConsole && !noConsole){
       console.log(text);
    }
}

function shape__prettyStack(fullStack, add){
    var options = {e:fullStack};
    var trace = printStackTrace(options);
    var strTrace;
    if(add==undefined){
        add=2;
    }
    if(fullStack == undefined || fullStack == false){
        for(var i=0;i<trace.length;i++){
            if(trace[i].indexOf("prettyStack") != -1){
                strTrace =  trace[i+add];
                if(strTrace != null){
                    strTrace = strTrace.replace(getBaseUrl(),"");
                } else{
                    strTrace = trace[trace.length -1];
                }
            }
        }
    }
    else{
        var lines = trace[0].split("\n");
        strTrace =  lines[1] + ":";
    }
    return strTrace;
}

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

function dumpArgs(args){
    function stringify(o){
        if(typeof o == "string" || typeof o == "number"){
            return o;
        }

        try{
            return J(o);
        }   catch(err){
            if(o && typeof o == "object"){
                if(o.__meta) {
                    return  "{"+obj.getClassName + o.getPK()+"}";
                }
                var ret = "";
                var first = true;
                for(var i in o){
                    if(first){
                        first = false;
                        ret +=  "{ ";
                    } else {
                        ret +=  ", ";
                    }
                    ret +=  i;
                    ret +=  ":";
                    ret +=  stringify(o[i]);
                }
                ret+="}";
                return ret
            }
        }
    }

    var str = "";
    for(var i=0; i<args.length; i++) {
        str += " ";
        str += stringify(args[i]);
    }

    return str;
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
