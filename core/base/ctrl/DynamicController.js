shape.registerCtrl("DynamicController",{
    beginExpansion:function(){
        var self = this;
        this.expander(function(){
            self.afterExpansion(self);
        });
    },
    init:function(){
        this.isCWRoot = true;
    },
    expander:function(callback){
        if(this.model){
            var className=ShapeUtil.prototype.getType(this.model);
            if(this.oldModelClass!=className){
                this.oldModelClass=className;

                var self = this;
                shape.getPerfectShape(this.model, this.getContextName(), function(newElem){
                    var ch = $(newElem);
                    self.view.innerHTML = "";
                    $(self.view).append(ch);
                    shape.bindAttributes(self.view, self);
                    callback();
                });
            }
        }else{
            callback();
        }
    },
    toView:function(){
        var self = this;
        this.expander(function(){
            self.afterChildExpansion(self);
        });
    }
});
