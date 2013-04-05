/**
 default button controller
 */

shape.registerCtrl("base/ul",{
    beginExpansion:function(){
        this.domCache = new DOMCache();
        var self = this;
        this.expander(function(){
            self.afterExpansion(self);
        });
    },
    init:function(){
    },
    expander:function(callback){
        var view = $(this.view);
        var selfCtrl = this;
        if(this.model){
            this.domCache.doRefresh( this.model, this,
                function(){
                    view.children().each(function(){$(this).detach()});
                },
                function(newElement){
                    view.append(newElement);
                },
                function(){
                    callback();
                }
            );
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
