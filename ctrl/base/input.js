/**
    default button controller
 */

registerShapeController("base/input",{
    model:null,
    init:function(){
        if(this.view.tagName.toLowerCase() == "input"){
            this.input = this.view;
        } else{
            this.input = $(this.view).find("input")[0];
        }
        this.toView();
        $(this.input).change(this.onChange);
    },
    getDOMInput:function(){

    },
    toView:function(){
        if(this.model != undefined && this.model != null){
            this.input.value = this.model;
        }
        //console.log("Binding input text: " + JSON.stringify(this.model));
    },
    onChange:function(){
        if($(this.view).attr("type") == "checkbox"){
            this.model = ! this.model;
        } else{
            this.model = this.input.value;
        }
        this.modelAssign(this.model);
    }
});