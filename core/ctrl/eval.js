/**
    default button controller
 */

shape.registerCtrl("eval",{
    init:function(){
        this.expression = null;


        this.useValue = $(this.view).attr("value") == undefined ? false : true;
        /*this.toView();*/
    },
    toView:function(){
        if(this.expression == null){
            var element = $(this.view);
            this.expression = newShapeExpression(element.text() );
            this.expression.bindToPlace(this, function(m, p , value, oldValue){
                element.text(value);
            });
        }
    }
});