
/*
    Similar with Dynamic controller but is caching views
    listens for closeView event to clear cached view
 */

shape.registerCtrl("ViewCacheCtrl",{


    beginExpansion:function(){
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
        this.isCWRoot = true;
        this.cache = {};
        var self = this;
        this.parentCtrl.addChangeWatcher(this.chain,
            function(changedModel, modelProperty, value){
                self.changeModel(value);
            }
        );
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
                console.log("Creating view for " + this.model);
                shape.getPerfectShape(undefined, this.model, this.getContextName(), function(newElem){
                    console.log(newElem);
                    self.lastInserted = $(newElem);
                    $(self.view).append(self.lastInserted);
                    shape.bindAttributes(self.view, self);
                    self.cache[model] = self.lastInserted;
                    callback();
                });
            }
       }
// else{
//            if(this.view){
//                if(this.lastInserted){
//                    this.lastInserted.detach();
//                }
//            }
//            callback();
//        }
    },
    toView:function(){
        this.beginExpansion();
    },
    autoExpand:function(){
        this.beginExpansion();
    }
});
