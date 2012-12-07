/**
 app controller
 */

//controller for viewModel: todo.js
shape.registerCtrl("todo",{
    count:0,
    init:function(){
        this.addChangeWatcher("newTitle", this.addNewTitle);
        watchHashEvent(this);
    },
    addNewTitle :function(){
        if( this.model.newTitle != ""){
            dprint("New task added..." + this.model.newTitle);
            this.model.recentTask = this.model.addNewTask(this.model.newTitle);
            this.model.newTitle = "";
        }
    },
    action: function(type, model){
        //cprint("Action required: " + type+ " for " + model);
        if(type == "completedToggle"){
            this.model.toggle(model);
        } else if(type == "remove"){
            this.model.remove(model);
        }else if(type == "removeAllCompleted"){
            this.model.removeAllCompleted();
        }else if(type == "completedTasks"){
            this.model.current = this.model.completed;
            this.setLinkSelection(type);
        }else if(type == "activeTasks"){
            this.model.current = this.model.active;
            this.setLinkSelection(type);
        }else if(type == "allTasks"){
            this.model.current = this.model.all;
            this.setLinkSelection(type);
        }
        else{
          wprint("Unknown action " + type);
        }
    },
    toView:function(){

    },
    setLinkSelection:function(href){
        $(shape.localFilter(this.view, "a[class='selected']")).toggleClass("selected");
        $(shape.localFilter(this.view, "a[href='#"+href+"']")).toggleClass("selected");
    }
});

