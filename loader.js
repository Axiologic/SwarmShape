function shapeOnReady(){

    /*var model = {
     menu:["Inc","Dec","Alert"],
     buttonText:"Click me!",
     labelText:"No click yet!",
     buttonModel:{
     text:"Click here!"
     },
     isBold:false,
     labelStyle:"boldStyle",
     addBtn:"Add"
     }; */
    var model = newTransientObject("todo");
    initialiseShape(document.getElementById("main"), model);
}
if(!$.isReady)
{
   // console.log('aici');
    $(document).ready(shapeOnReady);
    jQuery(shapeOnReady);
}else{
    // console.log('deja construit!');
    shapeOnReady();
}