/**
 home controller
 */

registerShapeController("home",{
    count:0,
    init:function(){
    },
    dispatch:function(event, viewElement, value){
        //window.alert(viewElement.id + " got event " + event);
        this.count++;
        this.model.labelText = "Clicked " + this.count + " times";
    }
});

