
function ShapeAttribute(attributeName, description){
  var attributeName = attributeName;
  var description   = description;

  this.applyAttribute = function(dom, value, ctrl) {
       if(description.applyAttribute){
           description.applyAttribute(dom, value,ctrl);
       }
  }
    this.expandHTMLTag = description.expandHTMLTag;
}

shape.registerAttribute("shape-visible",{
   "applyAttribute":function(dom, newValue, ctrl){
       if(newValue == undefined || newValue == null || newValue == false || newValue == 0 || newValue == "false"){
           $(dom).css('display', 'none');
       } else {
           $(dom).css('display', 'inline');
       }
   },
   "expandHTMLTag":false
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

shape.registerAttribute("shape-context",{
    "applyAttribute" : function(dom, newValue, ctrl){
        if(newValue){
            ctrl.contextName = newValue;
        }

        ctrl.autoExpand();
    },
    "expandHTMLTag"  : true
});


shape.registerAttribute("shape-value",{
    "applyAttribute" : function(dom, newValue, ctrl){
        if(newValue){
            var d = $(dom);
            if(d.is("img")){
                d.attr("src", newValue);
            }
        }
    },
    "expandHTMLTag"  : false
});

shape.registerAttribute("shape-action",{
    "applyAttribute" : function(dom, newValue, ctrl){
        if(newValue){
            var d = $(dom);
            if(newValue == "none"){
                d.attr("action", "javascript:void(0);");
            } else{
                d.attr("action", newValue);
            }
        }
    },
    "expandHTMLTag"  : false
});

