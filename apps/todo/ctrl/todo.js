/**
 app controller
 */

//controller for viewModel: todo.js
shape.registerCtrl("todo",{
    count:0,
    init:function(){
        this.addChangeWatcher("newTitle", this.addNewTitle);
        this.on(SHAPEEVENTS.URL_CHANGE, this.hashResponse);
        this.on("completedToggle", this.clickResponse);
        this.on("completedToggle", this.clickResponse);
        this.on("remove", this.clickRemove);
        watchHashEvent(this);
    },
    addNewTitle :function(){
        if( this.model.newTitle != "" && this.model.newTitle){
            dprint("New task added..." + this.model.newTitle);
            this.model.recentTask = this.model.addNewTask(this.model.newTitle);
            this.model.newTitle = "";
        }
    },
    hashResponse: function(event){
        //cprint("Action required: " + type+ " for " + model);
        var selection=event.selection;
        if(selection == "completedTasks"){
            this.model.current = this.model.completed;
            this.setLinkSelection(selection);
        }else if(selection == "activeTasks"){
            this.model.current = this.model.active;
            this.setLinkSelection(selection);
        }else if(selection == "allTasks"){
            this.model.current = this.model.all;
            this.setLinkSelection(selection);
        }
        else{
            if(selection!=undefined){
                wprint("Unknown action " + selection);
            }
        }
    },
    clickRemove:function(event){
        var model = event.viewModel;
            this.model.remove(model);
    },
    clickResponse:function(event){
        var action = event.type;
        var model = event.viewModel;
        if(action == "completedToggle"){
            this.model.toggle(model);
        } else if(action == "remove"){
            this.model.remove(model);
        }else if(action == "removeAllCompleted"){
            this.model.removeAllCompleted();
        }else{
            wprint("Unknown action " + action);
        }
     },
    toView:function(){

    },
    setLinkSelection:function(href){
        $(shape.localFilter(this.view, "a[class='selected']")).toggleClass("selected");
        $(shape.localFilter(this.view, "a[href='#selection/"+href+"']")).toggleClass("selected");
    }
});

