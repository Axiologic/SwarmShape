
shape.registerCtrl("DynamicController",{

    beginExpansion:function(){
        var self = this;
        if(!this.fence){
            this.__defineGetter__("dynamicContext",function(){
                return self.getContextName();
            });

            this.fence = new PropertiesFence(this, ["model","dynamicContext"], function(){
                self.expander(function(){
                    self.afterExpansion(self);
                });
            });
        }
        this.fence.acquire();
    },
    init:function(){
        this.isCWRoot = true;
    },
    expander:function(callback){
        if(this.model){
           /* var className=ShapeUtil.prototype.getType(this.model);
            if(this.oldModelClass!=className){
                this.oldModelClass=className;*/

                var self = this;
                shape.getPerfectShape(undefined, this.model, this.getContextName(), function(newElem){
                    var ch = $(newElem);
                    if(self.view){
                        self.view.innerHTML = "";
                    }else{
                        return;
                    }
                    $(self.view).append(ch);
                    shape.bindAttributes(self.view, self);
                    callback();
                });
            /*}*/
        }else{
            if(this.view){
                this.view.innerHTML = "";
            }
            callback();
        }
    },
    toView:function(){
        this.beginExpansion();
    },
    autoExpand:function(){
        this.beginExpansion();
    }
});
