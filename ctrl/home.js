/**
 home controller
 */

registerShapeController("home",{
    count:0,
    init:function(){
        console.log("addChangeWatcher " + J(this.model))
        this.addChangeWatcher("isBold", this.boldChecked);
    },
    dispatch:function(event, viewElement, value){
        this.count++;
        this.model.labelText = "Clicked " + this.count + " times";
    },
    boldChecked :function(){
        console.log("Cucu");
        if(this.model.isBold == true){
            this.model.labelStyle = "boldStyle";
        }
        else{
            this.model.labelStyle = "lightStyle";
        }
    }
});

