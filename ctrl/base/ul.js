/**
 default button controller
 */

registerShapeController("base/ul",{
    model:null,
    init:function(){

    },
    toView:function(){
        var view = $(this.view);
        view.empty();
        for(var i=0; i< this.model.length; i++){
            var div = view.append("<div shape-view='shape/task'></div>");
            console.log(div);
            expandShape(div[0], this);
        }
    },
    onChange:function(){

    }
});