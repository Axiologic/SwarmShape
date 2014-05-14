
function cprint(){
    var str = dumpArgs(arguments);
    console.log(str);
    __ShapeDebugUtil_bufferConsole(str);
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

//internal stuff
var shape__linePrint_hasConsole = typeof console; // for IE...

ShapeDebugUtil_bigBuffer = [];

var browser_console;
__ShapeDebugUtil_bufferConsole = function(){
    var line = "";
    for(var i=0;i<arguments.length;i++){
        line += " ";
        line += arguments[i];
    }
    ShapeDebugUtil_bigBuffer.push(line);
    return line;
}


if (!shape__linePrint_hasConsole  || !console || !console.log || !console.error) {
    console = {log: __ShapeDebugUtil_bufferConsole, error: __ShapeDebugUtil_bufferConsole};
}

hookConsoleOnMobile = function(){
    console = {log: __ShapeDebugUtil_bufferConsole, error: __ShapeDebugUtil_bufferConsole};
}


function shape__linePrint(prefix, text, fullStack, noConsole){
    var text = shape__prettyStack(fullStack,3)+'>>'+text;

    __ShapeDebugUtil_bufferConsole(prefix + text);
    if(shape__linePrint_hasConsole && !noConsole){
        if(browser_console){
            browser_console.log(text);
        }

    }
}
var debug_shape_baseUrl;
function debug__getBaseUrl(){
    if(debug_shape_baseUrl  == undefined){
        var l = window.location;
        debug_shape_baseUrl = l.protocol + "//" + l.host + "/" + l.pathname.split('/')[1];
    }
    return debug_shape_baseUrl;
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
                    strTrace = strTrace.replace(debug__getBaseUrl(),"");
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


(function() {

    function addEvent(evnt, elem, func) {
        if (elem.addEventListener)  // W3C DOM
            elem.addEventListener(evnt,func,false);
        else if (elem.attachEvent) { // IE DOM
            elem.attachEvent("on"+evnt, func);
        }
        else { // No much to do
            elem[evnt] = func;
        }
    }

    // how many milliseconds is a long press?
    var longPress = 1000;
    var reallyLongPress = 7000;
    // holds the start time
    var start;
    var main = window.document;


    addEvent( 'touchstart', main, function( e ) {
        start = new Date().getTime();
        //alert('mousedown!');
    } );


    addEvent( 'touchend', main, function( e ) {
        if ( new Date().getTime() >= ( start + reallyLongPress )  ) {
            alert('Really Long press debug info:' + J(ShapeDebugUtil_bigBuffer));
            var res = "<ul>";
            for(var i= 0, len = ShapeDebugUtil_bigBuffer.length;i<len;i++ ){
                res += "<li>";
                res += ShapeDebugUtil_bigBuffer[i];
            }
            res += "</ul>";
            document.body.innerHTML = res;
        }

        if ( new Date().getTime() >= ( start + longPress )  ) {
            alert('Long press debug info:' + J(ShapeDebugUtil_bigBuffer));
        }
        start = 0;
    } );

}());

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
                    return  "{" + obj.getClassName + o.getPK()+"}";
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