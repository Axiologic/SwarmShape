
/*
    Similar with Dynamic controller but is caching views
    listens for closeView event to clear cached view
 */

shape.registerCtrl("ViewCacheCtrl",{


    beginExpansion:function(){
        this.init();
        var self = this;
        if(!this.fence){
            this.__defineGetter__("computedContext",function(){
                return self.getContextName();
            });

            this.fence = new PropertiesFence(this, ["model", "view", "computedContext"], function(){
                self.expander(function(){
                    self.afterExpansion(self);
                });
            });
        }
        this.fence.acquire();
    },
    init:function(){
        if(!this.cache){
            this.cache = {};
        }
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
     canDestroyChildren : function(children){
        return false;
    },
    expander:function(callback){
        if(this.model){
            if(this.lastInserted){
                this.lastInserted.detach();
                //$(this.view).empty();
            }

            var existingView = this.cache[this.model];
            if(existingView){
                this.lastInserted = existingView;
                $(this.view).append(existingView);
                callback();
            } else {
                var self = this;
                var model = this.model;    // don't relay on this.model in callback
                shape.getPerfectShape(undefined, this.model, this.getContextName(), function(newElem){
                    self.lastInserted = $(newElem);
                    $(self.view).append(self.lastInserted);
                    shape.bindAttributes(self.view, self);
                    self.cache[model] = self.lastInserted;
                    callback();
                });
            }
       }
        else{
                    if(this.view){
                        if(this.lastInserted){
                            this.lastInserted.detach();
                        }
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
