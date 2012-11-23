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
            var m = this.model.getAt(i);
            //insertShapeChild(view, 'shapes/task', this.model[i]);
            var modelName = getMetaAttr(m,"className");
            var viewName = "shapes/"+modelName+"/"+modelName;
            loadShapeComponent(viewName,function(content){
                view.append(content);
                var li = view.children().last();
                expandShape(li[0], this, m);
            });
            dprint("Task: "+ m.description);
        }
    },
    onChange:function(){

    }
});