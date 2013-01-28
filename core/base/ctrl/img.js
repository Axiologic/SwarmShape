shape.registerCtrl("base/img",{
    init:function(){
    },
    toView:function(){
        if(this.model != undefined){
            this.view.src = this.model;
        }
    }
});