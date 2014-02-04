/**
    default button controller
 */

shape.registerCtrl("base/inputTime",{
    model:null,
    isCheckbox:false,
    init:function(){
        $(this.view).on("change",this.onChange);
        $(this.view).keyup(this.onChange);
        $(this.view).on("click",this.onChange);
        $(this.view).focus();

    },
    toView:function(){
        if(this.model != undefined && this.model != null){
            this.view.value = this.model;
            //$(this.view).removeAttr("disabled");
        } else {
            //$(this.view).attr("disabled","disabled");
        }
    },
    onChange:function(){

            this.model = this.view.value;
         this.modelAssign(this.model);
    }
});