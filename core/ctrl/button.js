/**
    default button controller
 */

shape.registerCtrl("button",{
    model:null,
    init:function(){
        $(this.view).on("click", this.onClick);
        this.shape_action = $(this.view).attr("shape-event");
        this.shape_action = this.shape_action.trim();
        if(this.shape_action[0] == "@"){
            this.isBindedProperty = true;
            this.shape_action = this.shape_action.substr(1);
        }
        //dprint("Created " + this.shape_action);
        if(this.shape_action == undefined){
            this.shape_action = "click";
        }
    },
    toView:function(){
    },
    onClick:function(objectId){
        var action;

        if(this.isBindedProperty){
            action = this.model[this.shape_action];
        } else {
            action = this.shape_action;
        }

        //dprint("Click action: ", action);
        this.emit(new ClickEvent(action, this.model));
    }
});