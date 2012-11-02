/**
    default button controller
 */

registerShapeController("base/button",{
    model:null,
    ctor:function(model){
        this.model = model;

    },
    click:function(objectId){
        window.alert(objectId.innerText + " Clicked!")
    }
});