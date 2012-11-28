/**
 default button controller
 */

shape.registerCtrl("base/ul",{
    model:null,
    init:function(){

    },
    toView:function(){
        var view = $(this.view);
        view.empty();
        var selfCtrl = this;
        function getComponentBinder(model){
            return function(content){
                view.append(content);
                var li = view.children().last();
                //  dprint("Inserting Task in list: " + model.description);
                expandShape(li[0], selfCtrl, model);
            }
        }
        for(var i=0; i < this.model.size(); i++){
            var m = this.model.getAt(i);
            if(m == undefined){
                wprint("Wtf!");
            }
            var modelName = getMetaAttr(m,"className");
            var viewName = "shapes/"+modelName+"/"+modelName;
            loadShapeComponent(viewName,getComponentBinder(m));
        }
    },
    onChange:function(){

    }
});