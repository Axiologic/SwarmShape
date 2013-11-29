shape.registerCtrl("testsSuiteCtrl",{
    init:function(){
       this.on(SHAPEEVENTS.URL_CHANGE, this.hashResponse);
       this.on("runTests", this.runTestHandler);
       watchHashEvent(this);
    },
    toView:function(){

    },
    runTestHandler:function(event){
           runTests();
    },
    hashResponse:function(event){
       var selection=event.selection;
       switch(selection){
           case "passed":
               this.model.currentSelection = this.model.passedTests;
               this.setLinkSelection(selection);
               break;
           case "failled":
               this.model.currentSelection = this.model.failledTests;
               this.setLinkSelection(selection);
               break;
           default:
           this.model.currentSelection = this.model.tests;
           this.setLinkSelection('all');
           break;
       }
    },
    setLinkSelection:function(href){
        $(shape.localFilter(this.view, "a[class='selected']")).toggleClass("selected");
        $(shape.localFilter(this.view, "a[href='#selection/"+href+"']")).toggleClass("selected");
    }
});