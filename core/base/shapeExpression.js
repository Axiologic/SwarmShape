ShapeExpression=function(expression){
    var expression = expression;

    var chains = expression.match(/(@(?:[^\W]+\.{1})*[^\W]*)/g);
    var interpretedExpress = expression;
    for(var i=0;i<chains.length;i++){
        if(chains[i] == '@'){
            interpretedExpress = interpretedExpress.replace("@", "this.ctrl.model");
        }else{
            try{
                var t = chains[i].slice(1);
                interpretedExpress = interpretedExpress.replace(chains[i], "this.ctrl.model."+t);
            }catch(e){
                console.log(e);
            }

        }
    }

    //= expression.replace(/@/g, "this.ctrl.model.");
    var handler = null;

    var evalToDO = "var x = function(){\n" +
        "return " +interpretedExpress+";\n"+
        "}; \nx;\n";
    //console.log(evalToDO);
    handler=eval(evalToDO);
    handler = handler.bind(this);

    function callhandler(){
        try{
            return handler();
        }catch(err){
            return null;
        }
    }
    this.bindToPlace = function(_ctrl, _onChangeHandler){
        this.ctrl = _ctrl;
        onChangeHandler = _onChangeHandler;
        for(var i=0; i<chains.length;i++){
            this.ctrl.addChangeWatcher(chains[i].slice(1), function(model, prop, value, oldValue){
                _onChangeHandler(model, prop, callhandler(), oldValue);
            });
        }
    }
}

function newShapeExpression(expression){
    try{
        var validExpression = expression.search(/[@=><]/);

        if(validExpression==-1){
            return null;
        }else{
          // console.log("Valid Expression: "+expression);
           return new ShapeExpression(expression);
        }
    }catch(error){
        wprint("Syntax error in expression: "+expression);
    }
}