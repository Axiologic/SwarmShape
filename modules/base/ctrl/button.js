/**
    default button controller
 */

shape.registerCtrl("base/button",{
    model:null,
    init:function(){
        $(this.view).live("click", this.onClick);
        this.shape_action = $(this.view).attr("shape-action");
        if(this.shape_action == undefined){
            this.shape_action = "click";
        }
    },
    toView:function(){
    },
    onClick:function(objectId){
        this.action(this.shape_action, this.model);
    }
});