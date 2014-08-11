
shape.registerCtrl("DynamicController",{

    beginExpansion:function(){
        var self = this;
        if(!this.fence){
            this.__defineGetter__("computedContext",function(){
                return self.getContextName();
            });

            this.fence = new PropertiesFence(this, ["model", "view", "computedContext"], function(){
                var contextName = self.getContextName();
                if(self.savedContextName != contextName){
                    //self.clearCache();
                    self.savedContextName = contextName;
                }
                self.expander(function(){
                    self.afterExpansion(self);
                });
            });
        }
        this.fence.acquire();
    },
    init:function(){
        console.log("Creating an DynamicController");
        //this.isCWRoot = true;
    },
    watchModelChanges:function(){
        this.isCWRoot = true;
        var self = this;
        this.parentCtrl.addChangeWatcher(this.chain,
            function(changedModel, modelProperty, value){
                self.changeModel(value);
            }
        );
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
                        console.log("no view yet!");
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
    toView:function(clearCache){
        this.beginExpansion();
    },
    autoExpand:function(){
        this.beginExpansion();
    }
});
