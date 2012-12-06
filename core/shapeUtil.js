/*
    Utilities:
    J - returns a JSON from an object

    cprint // print messages in the java script console
    wprint // print warnings (log!?)
    dprint  // a print debug messages (remove those in release)
 */


function cprint(str, fullStack){
    shape__linePrint("",str, fullStack);
}


function dprint(str, fullStack){
    shape__linePrint("Debug:",str,fullStack);
}

function wprint (str,fullStack){
    shape__linePrint("Warning:",str, fullStack);
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

function shape__linePrint(prefix,text, fullStack){
    var trace = printStackTrace();
    var strTrace;
    if(fullStack == undefined || fullStack == false){
        for(var i=0;i<trace.length;i++){
            if(trace[i].indexOf("linePrint") != -1){
                strTrace =  trace[i+2];
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
    text = strTrace + ">>\t"  + text;

    if(shape__linePrint_hasConsole == "undefined"){
        console = prefix + text;
    }else{
        console.log(prefix + text);
    }
}



