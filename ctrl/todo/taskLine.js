
//controller for viewModel: todo.js
registerShapeController("todo/taskLine",{
    count:0,
    init:function(){
        this.addChangeWatcher("completed", this.completedChanged);
        this.oldValue = this.model.completed;
    },
    toView:function(){
        $(this.view).toggleClass("completed", this.model.completed);
        this.oldValue = this.model.completed;
    },
    completedChanged:function(){
        if(this.oldValue != this.model.completed){
            $(this.view).toggleClass("completed", this.model.completed);
            this.action("completedToggle",this.model);
        }
    }
});
