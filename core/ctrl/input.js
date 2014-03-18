/**
    default button controller
 */

shape.registerCtrl("base/input",{
    model:null,
    isCheckbox:false,
    init:function(){

        this.isCheckbox = ($(this.view).attr("type") == "checkbox");
        this.isOnKey = ($(this.view).attr("shape-param") == "eachKey");
        if(!this.isOnKey){
            $(this.view).on("change",this.onChange);
        } else {
            $(this.view).keyup(this.onChange);
            $(this.view).on("click",this.onChange);
            $(this.view).focus();
        }
    },
    toView:function(){
        if(this.model != undefined && this.model != null){
            if(this.isCheckbox){
                if(this.model){
                    $(this.view).attr("checked","true");
                } else {
                    $(this.view).removeAttr("checked");
                }
            }
            this.view.value = this.model;
            //$(this.view).removeAttr("disabled");
        } else {
            //$(this.view).attr("disabled","disabled");
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