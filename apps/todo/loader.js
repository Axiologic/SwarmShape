function shapeOnReady(){
    var model = newTransientObject("todo");
    initialiseShape(document.getElementById("main"), model);
}
if(!$.isReady)
{
    $(document).ready(shapeOnReady);
    jQuery(shapeOnReady);
}else{
    shapeOnReady();
}