
function makeEventEmitter(obj, parent){
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
            wprint("Who will catch an event without a type? Directly use \"pub\" for this. "+J(event));
        }

        shapePubSub.pub(obj,event);

        if(parent && !obj.isController){
            parent.emit(event);
            return;
        }

        if(obj.isController){
            var domParentCtrl = obj.findDOMParentCtrl(obj.view);
            if(domParentCtrl){
                delete event.__transmisionIndex;
                domParentCtrl.emit(event);
            }
        }
    }
}