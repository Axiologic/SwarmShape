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
            view.append("<li shape-view='shapes/task' shape-ctrl='todo/taskLine' class='completed'></div>");
            var div = view.children().last();
            expandShape(div[0], this, m);
            console.log("Task: "+ m.description);
        }
    },
    onChange:function(){

    }
});