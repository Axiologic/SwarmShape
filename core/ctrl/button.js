/**
    default button controller
 */

shape.registerCtrl("button",{
    model:null,
    init:function(){
        $(this.view).on("click", this.onClick);
        this.shape_action = $(this.view).attr("shape-event");
        //dprint("Created " + this.shape_action);
        if(this.shape_action == undefined){
            this.shape_action = "click";
        }
    },
    toView:function(){
    },
    onClick:function(objectId){
        this.emit(new ClickEvent(this.shape_action, this.model));
    }
});