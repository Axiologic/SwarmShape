/**
    default button controller
 */

shape.registerCtrl("base/label",{
    init:function(){
        this.label = this.view;
        /*if(this.view.attr("shape-view") == "label"){
            this.label = this.view.find("label")[0];
        }*/
        this.useValue = $(this.view).attr("value") == undefined ? false : true;
        /*this.toView();*/
    },
    toView:function(){
        if(!this.useValue&&this.model != undefined){
            this.label.innerText = this.model;
            //textContent for firefox ONLY!!!
            this.label.textContent = this.model;
        }
    },
    applyHtmlAttribute:function(attributeName, element, value, overrideDefault){
        if(attributeName=="value"){
            element.innerText = value;
            //textContent for firefox ONLY!!!
            element.textContent = value;
        }else{
            BaseController.prototype.applyHtmlAttribute(attributeName, element, value, overrideDefault)
        }
    }
});