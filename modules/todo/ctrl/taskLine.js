
//controller for viewModel: todo.js
shape.registerCtrl("todo/taskLine",{
    count:0,
    init:function(){
        this.oldValue = this.model.completed;
        this.addChangeWatcher("completed", this.completedChanged);
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
    }
});
