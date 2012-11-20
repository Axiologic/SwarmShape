/**
 home controller
 */

registerShapeController("todo/taskLine",{
    count:0,
    init:function(){

    },
    toView:function(){
        console.log("todo/taskLine" + this.model);
    }
});

