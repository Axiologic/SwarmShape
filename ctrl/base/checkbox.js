/**
    default button controller
 */
//TODO: hide those damn binds
registerShapeController("base/checkbox",{
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
        this.model = ! this.model;
        console.log("Checkbox:" + this.model)
        this.chainAssign(this.model);
    }
});