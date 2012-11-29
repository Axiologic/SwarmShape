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
                view.empty();
            },
            function(newElement){
                view.append(newElement);
            },
            function(){
                cprint("End ul refresh");
            //do nothing, end of
            }
        );
    }
});