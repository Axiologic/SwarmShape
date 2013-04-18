shape.registerCtrl("DynamicController",{
    duringExpansion:false,
    refreshDuringExpansion:false,
    beginExpansion:function(){
        var ctxt = this.getContextName();
        if(this.oldModel != this.model || this.oldContext  != ctxt){
            if(!this.duringExpansion){
                this.duringExpansion = true;
               this.oldModel = this.model;
                this.oldContext  = ctxt;
                var self = this;
                this.expander(function(){
                    self.afterExpansion(self);
                    self.duringExpansion = false;
                    if(self.refreshDuringExpansion){
                        self.refreshDuringExpansion = false;
                        self.beginExpansion();
                    }
                });
            } else{
                this.refreshDuringExpansion = true;
            }
        }
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
                shape.getPerfectShape(this.model, this.getContextName(), function(newElem){
                    var ch = $(newElem);
                    self.view.innerHTML = "";
                    $(self.view).append(ch);
                    shape.bindAttributes(self.view, self);
                    callback();
                });
            /*}*/
        }else{
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
