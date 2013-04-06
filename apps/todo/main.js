//returns a model
function shapeMain(){
    var model = shape.newTransient("todo");
    model.addNewTask("Task number 1");
    model.addNewTask("Task number 2");
    return model;
}