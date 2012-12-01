
//controller for viewModel: todo.js
shape.registerCtrl("todo/taskLine",{
    count:0,
    init:function(){
        this.oldValue = this.model.completed;
        this.addChangeWatcher("completed", this.completedChanged);
        $(this.view).on("dblclick", this.switchToEdit)
    },
    toView:function(){
        $(this.view).toggleClass("completed", this.model.completed);
        this.oldValue = this.model.completed;
    },
    completedChanged:function(){
        if(this.oldValue != this.model.completed){
            $(this.view).toggleClass("completed", this.model.completed);
            this.action("completedToggle",this.model);
            this.oldValue = this.model.completed;
        }
    },
    switchToEdit:function(){
        $(this.view).toggleClass("editing");
        $(this.view).query("");
        wprint("Eedit!!!");
    }
});
