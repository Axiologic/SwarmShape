

var ulCtrl = {
    beginExpansion:function(){
        var self = this;
        this.expander(function(){
            self.afterExpansion(self);
        });
    },
    init:function(){
        if(!this.domCache){
            var view  = $(this.view);
            var priority        = view.attr("data-shape-param-priority");
            var defaultElements = view.attr("data-shape-param-elements");
            if(defaultElements){
                defaultElements = parseInt(defaultElements);
            }

            if(!defaultElements || defaultElements < 1){
                if(detectMobile){
                    defaultElements = 5;
                } else {
                    defaultElements = 10;
                }
            }

            this.priorityList = priority;
            this.defaultElements = defaultElements;
            this.domCache = new DOMCache3(this, this.priorityList, this.defaultElements);
            this.on("wantMoreElements",this.moreElements);
            //this.model.on("CollectionChange", toView);
        }
    },
    moreElements:function(){
        this.domCache.pagination.more(this.defaultElements);
        this.expander();
    },
    expander:function(callback){
        this.init();
        var view = $(this.view);
        if(this.model){
            this.domCache.merge(this.model, view);
        }else {
            this.domCache.merge(null);
            view.empty();
        }
        if(callback){
            callback();
        }
    },
    toView:function(clearCache){
        var self = this;
        if(clearCache){
            this.domCache.clearCache();
            var view = $(this.view);
            view.empty();
        }
        this.expander(function(){
            self.afterChildExpansion(self);
        });
    }
};

shape.registerCtrl("base/ul",ulCtrl);
shape.registerCtrl("list",ulCtrl);
