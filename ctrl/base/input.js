/**
    default button controller
 */

registerShapeController("base/input",{
    model:null,
    init:function(){
        this.toView();
        var inp = $(this.view).find("input")[0];
        $(inp).change(this.onChange);
    },
    toView:function(){
        var inp = $(this.view).find("input")[0];
        inp.value = this.model;
        //console.log("Binding input text: " + JSON.stringify(this.model));
    },
    onChange:function(){
        var inp = $(this.view).find("input")[0];
        this.chainAssign(inp.value);
    }
});