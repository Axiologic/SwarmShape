
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
            console.log("Creating an ViewCacheCtrl");
            this.cache = {};
        }
    },
    watchModelChanges:function(){
        this.isCWRoot = true;
        var self = this;
        this.parentCtrl.addChangeWatcher(this.chain,
            function(changedModel, modelProperty, value){
                if(value == null){
                    //this.clearCache();
                }
                self.changeModel(value);
            }
        );
    },
     canDestroyChildren : function(children){
        return false;
    },
    requestAppender:function(callback){
        var self = this;
        var model = this.model;    // don't relay on this.model in callback

        this.cache[this.model] = true;
        shape.getPerfectShape(undefined, this.model, this.getContextName(), function(newElem){
            if(self.currentView && self.currentView !== true){
                self.currentView.css("display","none");
            }
            self.currentView = $(newElem);
            self.cache[model] = self.currentView;
            $(self.view).append(self.currentView);
            shape.expandExistingDOM(self.currentView, self, model);
            callback();
        });
    },
    expander:function(callback){
        if(this.model){
            if(this.currentView){
                this.currentView.css("display","none");
                //$(this.view).empty();
            }

            var existingView = this.cache[this.model];
            if(existingView){
                if(existingView !== true){
                    this.currentView = existingView;
                    this.currentView.css("display","block");
                }

                //$(this.view).append(existingView);
                callback();
            } else {
                this.requestAppender(callback);
            }
       }
        else{
            if(this.currentView){
                //this.currentView.detach();
                this.currentView.css("display","none");
            }
            callback();
        }
    },
    clearCache:function(){
        for(var v in this.cache){
            this.cache[v].css("display","none");
            this.cache[v].remove();
            delete this.cache[v];
        }
        this.currentView = undefined;
    },
    toView:function(clearCache){
        this.beginExpansion();
    },
    autoExpand:function(){
        this.beginExpansion();
    }
});


lprint("Initialising Shape controllers...");