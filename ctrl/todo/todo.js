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
            this.arrayPush(this.model.active,newTask);
            this.model.recentTask = newTask;
            this.model.newTitle = "";
        }
    },
    action: function(type, model){
        //cprint("Action required: " + type+ " for " + model);
        var active = this.model.active;
        var completed = this.model.completed;
        var current = this.model.current;

        if(type == "completedToggle"){
            if(model.completed == true){
                for(var i =0; i< active.length ; i++){
                    if(active.getAt(i) == model){
                        active.removeAt(i);
                        completed.push(model);
                    }
                }
            } else{
                for(var i =0; i< completed.length ; i++){
                    if(completed.getAt(i) == model){
                        completed.removeAt(i);
                        active.push(model);
                    }
                }
            }
        } else if(type == "remove"){
            for(var i = 0; i< current.length ; i++){
                if(current.getAt(i) == model){
                    current.removeAt(i);
                    cprint("Removing " + model);
                }
            }
        }else if(type == "removeAllCompleted"){
            completed.removeAll();
        }
        else{
          wprint("Unknown action " + type);
        }
    },
    toView:function(){

    }
});

