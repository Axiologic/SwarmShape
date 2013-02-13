
//controller for viewModel: todo.js
shape.registerCtrl("todo/taskLine",{
    count:0,
    init:function(){
        this.oldValue = this.model.completed;
        this.addChangeWatcher("completed", this.completedChanged);
        var myLabel = shape.localFilter(this.view,"label[id^='myLabel']");
        $(myLabel).on("dblclick", this.switchToEdit);
        $(this.view).keypress(this.keyHandler);
    },
    toView:function(){
        $(this.view).toggleClass("completed", this.model.completed);
        this.oldValue = this.model.completed;
    },
    completedChanged:function(){
        if(this.oldValue != this.model.completed){
            $(this.view).toggleClass("completed", this.model.completed);
            this.emit(new ClickEvent("completedToggle", this.model));
            this.oldValue = this.model.completed;
        }
    },
    switchToEdit:function(){
        $(this.view).toggleClass("editing");
        if($(this.view).hasClass("editing")){
            $(this.view).find(".edit").focus();
            $(this.view).find(".edit").bind('blur',this.switchToEdit);
        }else{
            $(this.view).find(".edit").unbind("blur");
        }
    },
    keyHandler:function(event){
        if(event.keyCode==13||event.keyCode==27)
        {
            this.switchToEdit();
        }
    }
});
