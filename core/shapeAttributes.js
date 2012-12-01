
function ShapeAttribute(attributeName, description){
  var attributeName = attributeName;
  var description   = description;

  this.applyAttribute = function(dom, value, ctrl) {
       if(description.applyAttribute){
           description.applyAttribute(dom, value,ctrl);
       }
  }
}

shape.registerAttribute("shape-visible",{
   "applyAttribute":function(dom, newValue, ctrl){
       if(newValue == undefined || newValue == null || newValue == false || newValue == 0 || newValue == "false"){
           $(dom).css('display', 'none');
       } else {
           $(dom).css('display', 'inline');
       }
   },
   "expandTag":false
});

shape.registerAttribute("shape-event",{
    "applyAttribute" : null,
    "expandHTMLTag"  : true
});

shape.registerAttribute("shape-ctrl",{
    "applyAttribute" : null,
    "expandHTMLTag"  : true
});

shape.registerAttribute("shape-view",{
    "applyAttribute" : null,
    "expandHTMLTag"  : true
});

shape.registerAttribute("shape-model",{
    "applyAttribute" : null,
    "expandHTMLTag"  : true
});