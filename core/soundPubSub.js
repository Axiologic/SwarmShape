/**
 *  Pub/Sub system that provides intuitive results regarding to asynchronous calls of callbacks and computed values/expressions
 * PubSub channels are available in browser (or node.js):
 *   we guarantee that any callback got executed on level 0 of callbacks executions
 *   Usually a callback will cause execution of other callbacks (level 1 if cause by a level 0 call back and so on)
 *
 *   we prevent immediate execution to ensure intuitive final results guaranteed by level 0 execution
 *   we guarantee that any callback function is "re-entrant"
 *
 *   we are also trying to reduce the number of callback execution by looking in queues at new messages published and
 *   trying to compact those messages (removing duplicate messages, modifying messages, or adding in the history of another event ,etc)

 *
 *  Example of what can be wrong with non-sound asynchronous calls:
 *  Initial values:
 *   a = 9;
 *   b = 1;
 *
 *  // e is computed expression based on chains a and b and defined like this:
 *   if( a + b < 10) {
 *       e = false;
 *       notify(...); // send a notification somewhere
 *       } else {
 *   e = true;
 *   }
 *
 *   we have another function that is doing:
 *    {
 *      b = 5;
 *      a = 2;
 *     }
 *
 *    e will be false in the end,and that s fine, but meantime, after b = 5 a fake notification was sent and that is wrong!
 *    soundPubSub guarantee that such annoying mistakes will not go to happen!
 *

 *   preventing any form of starvation by calling callbacks in the expected order !?
 *   preventing infinite loops execution !?
 *
 *
 *   More:
 *   you can use blockCallBacks and releaseCallBacks in a function that change a lot a collection or bindable objects and all
 *   the notifications will be sent compacted and properly
 */

// TODO: optimisation!? use an efficient queue instead of arrays with push and shift
// TODO: see how big those queues can be in real applications
// for a few hundreds items, queues made from array should be enough

// TODO: detect infinite loops (or very deep propagation) It is possible!?

var COLLECTION_CHANGE_EVENT_TYPE = "CollectionChange";
var PROPERTY_CHANGE_EVENT_TYPE   = "PropertyChange";

function CollectionChangeEvent(data){
    this.type = COLLECTION_CHANGE_EVENT_TYPE;
    this.history = [];
    this.history.push(data);
}

function PropertyChangeEvent(model,property,newValue, oldValue){
    this.type = PROPERTY_CHANGE_EVENT_TYPE;
    this.property = property;
    this.newValue = newValue;
    this.oldValue = oldValue;
}


function SoundPubSub(){
    // map channelName (object local id) -> array with subscribers
    var channelSubscribers = [];

    // map channelName (object local id) -> queue with waiting messages
    var channelsStorage = {};

    // object
    var typeCompactor = {};

    // channel names
    var executionQueue = [];
    var self = this;
    var level = 0;

    //an compactor take a newEvent and and oldEvent and return the one that survives (oldEvent if
    // it can compact the new one or the newEvent if can't be compacted)
    this.registerCompactor = function(type, callBack) {
        typeCompactor[type] = callBack;
    }

    /**
     *
     * @param fromReleaseCallBacks: hack to prevent too many recursive calls on releaseCallBacks
     * @return {Boolean}
     */
    function dispatchNext(fromReleaseCallBacks){
        if(level >0) {
            return false;
        }
        var channelName = executionQueue[0];
        if(channelName != undefined){
            self.blockCallBacks();
            try{
                var message = channelsStorage[channelName][0];
                if(message == undefined){
                    executionQueue.shift();
                } else {
                    if(message.__transmisionIndex == undefined){
                        message.__transmisionIndex = 0;
                    } else{
                        message.__transmisionIndex++;
                    }
                    var subscriber = channelSubscribers[channelName][message.__transmisionIndex];
                    if(subscriber == undefined){
                        channelsStorage[channelName].shift();
                    } else{
                        if(subscriber.filter == undefined || subscriber.filter(message)){

                                subscriber.callBack(message);

                        }
                    }
                }
            } catch(err){
                wprint("Event callback failed: "+ subscriber.callBack);
            }
            //
            if(fromReleaseCallBacks){
                level--;
            } else{
                self.releaseCallBacks();
            }
            return true;
        } else{
            return false;
        }
    }

    function compactAndStore(target, message){
        var gotCompacted = false;
        var arr = channelsStorage[target];
        if(arr == undefined){
            arr = [];
            channelsStorage[target] = arr;
        }
        if(message.type != undefined){
            var typeCompactorCallBack = typeCompactor[message.type];
            if(typeCompactorCallBack != undefined){
                for(var i = 0; i < arr.length; i++ ){
                    if(typeCompactorCallBack(message,arr[i]) == arr[i]){
                        // got compacted, bye bye message  but prevent loosing callbacks notifications
                        if(arr[i].__transmisionIndex == undefined) {
                            gotCompacted = true;
                            break;
                        }
                    }
                }
            }
        }

        if(!gotCompacted){
            arr.push(message);
            executionQueue.push(target);
        }
    }

    this.pub = function(target, message){
        if(channelSubscribers[target] != undefined){
            compactAndStore(target, message);
            dispatchNext();
            return channelSubscribers[target].length;
        } else{
            wprint("No one is subscribed to "+ J(target));
            return 0;
        }
    }

    this.sub = function(target, callBack, filter){
        //var fctRef = new FunctionReference(callBack);
        var subscriber = {"callBack":callBack, "filter":filter};
        var arr = channelSubscribers[target];
        if(arr == undefined){
            arr = [];
            channelSubscribers[target] = arr;
        }
        arr.push(subscriber);
    }

    this.unsub = function(target, callBack, filter){
        for(var i = 0; i < channelSubscribers[target].length;i++){
            var subscriber =  channelSubscribers[target][i];
            if(subscriber.callBack == callBack && (filter == undefined || subscriber.filter == filter )){
                subscriber.forDelete = true;
            }
        }

        for(var i = channelSubscribers[target].length-1; i >= 0 ; i--){
            var subscriber =  channelSubscribers[target][i];
            if(subscriber.forDelete == true){
                channelSubscribers[target].splice(i,1);
            }
        }
      }


    this.blockCallBacks = function(){
        level++;
    }

    this.releaseCallBacks = function(){
        level--;
        //hack/optimisation to not fill the stack in extreme cases (many events caused by loops in collections,etc)
        while(level == 0 && dispatchNext(true) ){
            // nothing,feed the best for a greater good :)
        }
    }

    this.registerCompactor(PROPERTY_CHANGE_EVENT_TYPE, function(newEvent, oldEvent){
        if(newEvent.type ==  oldEvent.type && newEvent.property == oldEvent.property ){
            newEvent.newValue = oldEvent.newValue;
            return oldEvent;
        }
        return newEvent;
    });

    this.registerCompactor(COLLECTION_CHANGE_EVENT_TYPE,function(newEvent, oldEvent){
        if(newEvent.type ==  oldEvent.type){
            for(var i = 0; i< newEvent.history.length; i++){
                oldEvent.history.push(newEvent.history[i]);
            }
        return oldEvent; // succes compacting
        }
        return newEvent; // not this time
    });
}

shapePubSub = new SoundPubSub();
