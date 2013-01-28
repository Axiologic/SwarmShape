shape.registerCtrl('base/link',{
    init:function(){
    },
    toView:function(){
        if(this.model != undefined){
            $(this.view).text(this.model);
        }
    }
})
