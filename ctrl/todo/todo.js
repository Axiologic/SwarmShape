/**
 app controller
 */

//controller for viewModel: todo.js
registerShapeController("todo/todo",{
    count:0,
    init:function(){
        this.addChangeWatcher("newTitle", this.addNewTitle);
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
        }
        else{
          wprint("Unknown action " + type);
        }
    },
    toView:function(){

    }
});

