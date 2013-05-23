
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
        var subscribers = shapePubSub.pub(obj,event);
        var arrSubscribers = null;
        if(arrSubscribers){
                for(var i=0; i<arrSubscribers.length; i++){
                    var val = arrSubscribers[i];
                    if(val.type && val.type == event.type){
                        arrSubscribers = subscribers;
                        break;
                    }
                }
        }

        if(!arrSubscribers && parent && !obj.isController){
            parent.emit(event);
            return;
        }

        if(obj.isController && !shapePubSub.pub(obj,event)){
            var domParentCtrl = obj.findDOMParentCtrl(obj.view);
            if(domParentCtrl){
                domParentCtrl.emit(event);
            }
        }
    }
}