/*
function ShapeEvent(type){
    this.type = type;
    this.data = [];
    for(var i=1;i< arguments.length; i++){
        this.data.push(arguments[i]);
    }
}

function shapeEventsFactory(){
    var signatures;
    this.registerEventSignature = function (){

    }
    this.create = function (type,params){
    }
}*/

function ClickEvent(userAction, viewModel){
    //this.type = SHAPEEVENTS.CLICK;
    //this.userAction = userAction;
    this.type = userAction;
    this.viewModel = viewModel;
}

function CollectionChangeEvent(collection, data){
    this.type = SHAPEEVENTS.COLLECTION_CHANGE;
    this.collection = collection;
    this.history = [];
    this.history.push(data);
}

function PropertyChangeEvent(model,property,newValue, oldValue){
    this.type = SHAPEEVENTS.PROPERTY_CHANGE;
    this.model      = model;
    this.property   = property;
    this.newValue   = newValue;
    this.oldValue   = oldValue;
}

/**                                                                        „
 *
 * @param model object
 * @cause property is a PropertyChangeEvent,CollectionChangeEvent
 * history is a
 */

function DocumentChangeEvent(cause){
    this.type    = SHAPEEVENTS.DOCUMENT_CHANGE;
    this.causes   = [];
    this.causes.push(cause);
}

function ShapeEvent(type, cause){
    this.type    = type;
    this.causes   = [];
    this.causes.push(cause);
}

/*
 function ObjectChangeEvent(className, pk, chain, newValue, oldValue){
    this.type = SHAPEEVENTS.OBJECT_CHANGE;
    this.className = className;
    this.pk = pk;
    this.chain = chain;
    //newValue and oldValue are serialized
    this.newValue = newValue;
    this.oldValue = oldValue;
}
*/