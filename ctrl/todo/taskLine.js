/**
 home controller
 */

registerShapeController("todo/taskLine",{
    count:0,
    init:function(){

    },
    toView:function(){
        dprint("todo/taskLine" + this.model);
    }
});

