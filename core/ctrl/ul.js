

var ulCtrl = {
    beginExpansion:function(){
        this.domCache = new DOMCache2(this);
        var self = this;
        this.expander(function(){
            self.afterExpansion(self);
        });
    },
    init:function(){
        this.myView = $(this.view);
    },
    expander:function(callback){
        var view = $(this.view);
        if(this.model){
            this.domCache.merge(this.model, view);
        }else {
            this.domCache.merge(null);
            view.empty();
        }
        callback();
    },
    toView:function(){
        //console.log("UL list: model changed");
        var self = this;
        this.expander(function(){
            self.afterChildExpansion(self);
        });
    }
};

shape.registerCtrl("base/ul",ulCtrl);
shape.registerCtrl("list",ulCtrl);
