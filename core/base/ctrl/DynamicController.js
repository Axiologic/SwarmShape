shape.registerCtrl("DynamicController",{
    init:function(){
        this.isCWRoot = true;
    },
    toView:function(){
        if(this.model&& this.oldModelClass!=this.model.getClassName()){
            this.oldModelClass=this.model.getClassName();
            this.view.innerHTML = "";
            self = this;
            shape.getPerfectShape(this.model, this.getContextName(), function(newElem){
                var ch = $(newElem);
                $(self.view).append(ch);
                shape.bindAttributes(self.view, self);
            });
        }
    }
});
