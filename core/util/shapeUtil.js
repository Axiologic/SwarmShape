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

function cprint(str, fullStack){
    shape__linePrint("",str, fullStack);
}

function xprint(str){
    //console.log(str);
}

function dprint(str, fullStack){
    shape__linePrint("Debug:",str,fullStack);
}

function wprint (str,fullStack){
    shape__linePrint("Warning:",str, fullStack);
}

function eprint(str, err){
    shape__linePrint("Error:", str+" "+err.message, err.stack);
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

function shape__linePrint(prefix, text, fullStack){
    var text = shape__prettyStack(fullStack,3)+'>>\n'+text;

    if(shape__linePrint_hasConsole == "undefined"){
        console = prefix + text;
    }else{
        console.log(prefix + text);
    }
}

function shape__prettyStack(fullStack, add){
    var trace = printStackTrace();
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
        strTrace = "\n\n" + trace.join("\n") + "\n";
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

function mergeInRepository(repo, key, newValues){
    if(repo[key]==undefined){
        repo[key] = {};
    }

    for(var newKey in newValues){
        if(repo[key][newKey]!=undefined){
            wprint("Overwriting key "+newKey);
        }
        //in some cases a full cloning could be more appropriate
        repo[key][newKey] = newValues[newKey];
    }
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

    function saveValues(){
        for(var i=0;i<properties.length;i++){
            self[properties[i]] = context[properties[i]];
        }
    }

    function valuesChanged(){
        for(var i=0;i<properties.length;i++){
            if(self[properties[i]] != context[properties[i]]) {
                return true;
            }
        }
        return false;
    }


    this.acquire = function (){
        fuckingCallLevel++;
        if(fuckingCallLevel >100){
            console.log("Recursion detected! Preventing...");
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
                    console.log("Fence error:" +  err);
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