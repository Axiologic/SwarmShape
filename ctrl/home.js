/**
 home controller
 */

registerShapeController("home",{
    count:0,
    init:function(){
        this.addChangeWatcher("isBold", this.boldChecked);
    },
    dispatch:function(event, viewElement, value){
        this.count++;
        this.model.buttonModel.text = "Clicked " + this.count + " times";
    },
    boldChecked :function(){
        console.log("Bold Checked!!!");
        if(this.model.isBold == true){
            this.model.labelStyle = "boldStyle";
        }
        else{
            this.model.labelStyle = "lightStyle";
        }
    },
    toView:function(){

    }
});

