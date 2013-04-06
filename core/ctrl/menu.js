/**
    default button controller
 */

shape.registerCtrl("base/menu",{
    model:null,
    init:function(){
        this.toView();
        var inp = $(this.view).find("ul")[0];
        //$(inp).change(this.onChange);
    },
    toView:function(){
        var inp = $(this.view).find("ul")[0];
        inp = $(inp);
        inp.empty();

        for(var i=0; i< this.model.length; i++){
            var str ="<li>"+this.model[i]+"</li>";
            inp.append($(str));
        }
        var links = inp.find("li");
        for(var i=0; i<=links.length; i++){
            var l= links[i];
            $(l).live("click",this.onChange);
        }
    },
    onChange:function(elem){
        //this.getCtxtCtrl().dispatch("menuClick",this.view);
        alert(elem.target.innerHTML + "  got clicked!")
    }
});