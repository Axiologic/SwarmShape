/**
 home controller
 */

registerShapeController("home",{
    model:null,
    ctor:function(model){
        this.model = model;

    },
    click:function(objectId){
        window.alert(objectId.innerText + " Clicked!")
    }
});