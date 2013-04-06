/**
 * This class offers support to emulate Interface.
 *
 * Below is a small example on how to define and use an interface:
 *
 *  //declaration:
 *      shape.registerInterface("NameOfInterface",{
 *          firstMemberName:"type",
 *          secondMemberName:"type",
 *          ...
 *          firstMethodName:"function"
 *          ...
 *      });
 *
 *  //usage:
 *      shape.registerModel("modelName",{
 *          ...
 *          memberName:{
 *                  type:"NameOfInterface"
 *          }
 *          ...
 *      });
 **/

function InterfaceDescription(declaration, interfaceName){
    var members = {};
    var functions = {};
    this.interfaceName = interfaceName;

    for(var a in declaration){
        if(declaration[a]=="function"){
            var newF = {};
            newF.type=declaration[a];
            functions[a] = newF;

        }else{
            if(typeof(declaration[a]) == "string"){
                var newM = {};
                newM.type = declaration[a];
                members[a] = newM;
            }else{
                wprint("'"+a+"' should be member or method declaration not anything else!");
            }
        }
    }

    /**
     * This method checks if passed object it is implementing the interface
     * @return boolean
     * */
    this.implementsYou = function(object){
        itemDesc = object.getClassDescription();
        objectFields = itemDesc.getFields();
        
        for(var memberName in members){
            if(memberName){
                var member = members[memberName];
                if(!objectFields[memberName] || objectFields[memberName].type!=member.type){
                    wprint("Member '"+memberName+"' is missing or has different type according to expected interface!");
                    return false;
                }
            }
        }

        for(var functionName in functions){
            if(functionName){
                var typ = typeof(object[functionName]);
                if(typ!='function'){
                    wprint("Function '"+functionName+"' is missing according to expected interface!");
                    return false;
                }
            }
        }
        return true;
    }
}