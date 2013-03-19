shape.registerCtrl("DynamicController",{
    init:function(){

    },
    toView:function(){
        if(this.model!=undefined && this.oldModelClass!=this.model.getClassName()){
            this.oldModelClass=this.model.getClassName();
            this.view.innerHTML = "";
            self = this;
            shape.getPerfectShape(this.model, this.getContextName(), function(newElem){
                shape.expandExistingDOM($(self.view).append(newElem).get(0), self, self.model);
            });
        }
    }
});
