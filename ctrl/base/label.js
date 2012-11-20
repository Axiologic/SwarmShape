/**
    default button controller
 */

registerShapeController("base/label",{
    init:function(){
        this.label = this.view;
        /*if(this.view.attr("shape-view") == "label"){
            this.label = this.view.find("label")[0];
        }*/
        this.toView();
    },
    toView:function(){

        if(this.model != undefined){
            this.label.innerText = this.model;
            //console.log("Label " +  this.model + this.domView);
        } else{
            console.log("Label " + this.model);
        }
    }
});