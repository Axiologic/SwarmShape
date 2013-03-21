shape.registerCtrl("DynamicController",{
    init:function(){
        this.isCWRoot = true;
    },
    toView:function(){
        var className=ShapeUtil.prototype.getType(this.model);
        if(this.model && this.oldModelClass!=className){
            this.oldModelClass=className;

            var self = this;
            shape.getPerfectShape(this.model, this.getContextName(), function(newElem){
                var ch = $(newElem);
                self.view.innerHTML = "";
                $(self.view).append(ch);
                shape.bindAttributes(self.view, self);
            });
        }
    }
});
