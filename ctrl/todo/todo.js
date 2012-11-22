/**
 app controller
 */

//controller for viewModel: todo.js
registerShapeController("todo/todo",{
    count:0,
    init:function(){
        this.addChangeWatcher("newTitle", this.addNewTitle);
    },
    dispatch:function(model){

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
    toView:function(){

    }
});

