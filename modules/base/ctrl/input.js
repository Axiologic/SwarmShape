/**
    default button controller
 */

shape.registerCtrl("base/input",{
    model:null,
    isCheckbox:false,
    init:function(){
        this.isCheckbox = ($(this.view).attr("type") == "checkbox");
        $(this.view).on("change",this.onChange);
    },
    toView:function(){
        if(this.model != undefined && this.model != null){
            this.view.value = this.model;
        }
    },
    onChange:function(){
        if(this.isCheckbox){
            this.model = ! this.model;
        } else{
            this.model = this.view.value;
        }
        this.modelAssign(this.model);
    }
});