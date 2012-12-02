
function makeEventEmitter(obj){
    obj.on = function(type, callBack){
        shapePubSub.sub(obj,callBack, function(message){
            if(message.type == type || (message.__meta && message.__meta.type == type) ){
                return true;
            }
            return false;
        });
    }

    obj.emit = function(event){
        if(event.type == undefined){
            wprint("Who will catch an event without a type? Directly use \"pub\" for this.");
        }
        shapePubSub.pub(obj,event);
    }
}