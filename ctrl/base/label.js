/**
    default button controller
 */

registerShapeController("base/label",{
    init:function(){
        this.toView();
    },
    toView:function(){
        var label = $(this.view).find("label")[0];
        label.innerHTML = this.model;
        //console.log("Label " + this.model);
    }
});