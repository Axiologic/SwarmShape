/**
    default button controller
 */

shape.registerCtrl("base/label",{
    init:function(){
        this.label = $(this.view);
        this.useValue = this.label.attr("value") == undefined ? false : true;
        var txt = $(this.view).text();
    },
    toView:function(){
        if(!this.useValue&&this.model != undefined){
            this.label.text(this.model);
        }
    },
    applyHtmlAttribute:function(attributeName, element, value, overrideDefault){
        if(attributeName=="value"){
            $(element).text(value);
        } else {
            BaseController.prototype.applyHtmlAttribute(attributeName, element, value, overrideDefault)
        }
    }
});