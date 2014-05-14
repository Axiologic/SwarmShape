
function makeEventEmitter(obj, parent){
    obj.on = function(type, callBack){

        /*if( type != "PropertyChange"  && type != "CollectionChange" && type != "DocumentChange" ){
            console.log("Subscribing at event " + type + " by " + obj.ctrlName);
        }*/

        shapePubSub.sub(obj,callBack, function(message){

            if(message.type == type || (message.__meta && message.__meta.type == type) ){
                /*if( message.type != "PropertyChange"  && message.type != "CollectionChange" && message.type != "DocumentChange" ){
                    console.log("Accepting  event " + message.type + " by " + obj.ctrlName);
                }*/
                return true;
            }
            /*if( message.type != "PropertyChange"  && message.type != "CollectionChange" && message.type != "DocumentChange" ){
                console.log("Rejecting  event " + message.type + " by " + obj.ctrlName  + " I'm looking for " + type);
            }*/
            return false;
        });
    }

    obj.emit = function(event){
        if(event.type == undefined){
            wprint("Who will catch an event without a type? Directly use \"pub\" for this. "+J(event));
        }

        /*if( event.type != "PropertyChange"  && event.type != "CollectionChange"){
            console.log("Emitting  " + event.type + " towards " + obj.ctrlName );
        }*/

        shapePubSub.pub(obj,event);

        if(parent && !obj.isController){
            parent.emit(event);
            return;
        }

        if(obj.isController){
            var domParentCtrl = obj.findDOMParentCtrl(obj.view);
            if(domParentCtrl){
                domParentCtrl.emit(event);
            }
        }
    }
    return obj ;
}



createPubSubChannel = function(name){
    var o = {toString:function(){return name}};
    makeEventEmitter(o);
    return o;
}

lprint("Initialising EventEmitters...");