/**
 app controller
 */

//controller for viewModel: todo.js
shape.registerCtrl("todo/todo",{
    count:0,
    init:function(){
        this.addChangeWatcher("newTitle", this.addNewTitle);
        watchHashEvent(this);
    },
    addNewTitle :function(){
        if( this.model.newTitle != ""){
            dprint("New task added..." + this.model.newTitle);
            var newTask = newPersistentObject("task");
            newTask.description = this.model.newTitle;
            this.model.active.push(newTask);
            this.model.all.push(newTask);
            this.model.recentTask = newTask;
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
        }else if(type == "showCompletedTasks"){
            this.model.current = this.model.completed;
        }else if(type == "showActiveTasks"){
            this.model.current = this.model.active;
        }else if(type == "allTasks"){
            this.model.current = this.model.all;
        }
        else{
          wprint("Unknown action " + type);
        }
    },
    toView:function(){

    }
});

