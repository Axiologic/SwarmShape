/**
 default button controller
 */

shape.registerCtrl("base/ul",{
    model:null,
    init:function(){
    this.domCache = new DOMCache();
    },
    toView:function(){
        var view = $(this.view);
        var selfCtrl = this;
        this.domCache.doRefresh( this.model, this,
            function(){
                view.children().each(function(){$(this).detach()});
            },
            function(newElement){
                view.append(newElement);
            },
            function(){
            //do nothing, be happy :)
            }
        );
    }
});
