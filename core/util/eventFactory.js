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
    this.type = SHAPEEVENTS.CLICK;
    this.userAction = userAction;
    this.viewModel = viewModel;
}