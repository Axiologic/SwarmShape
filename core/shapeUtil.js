var hasConsole = typeof console;


function linePrint(prefix,text, fullStack){
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

    if(hasConsole=="undefined")
    {
        console = prefix + text;
    }else{
        console.log(prefix + text);
    }

}

function cprint(str, fullStack){
    linePrint("",str, fullStack);
}


function dprint(str, fullStack){
    linePrint("Debug:",str,fullStack);
}

wprint = function(str,fullStack){
    linePrint("Warning:",str, fullStack);
}
