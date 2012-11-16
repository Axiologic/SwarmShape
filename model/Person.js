
registerModel("Person",{
        meta:{
            table:"Person",
            pk:"id"
        },
        id:{
            type:"int"
        },
        firstName:{
            type:"string",
            default:"NoNamed"
        },
        secondName:{
            type:"string"
        },
        fullName:{
             chains:"firstName,secondName",
             code:function(){
                return this.firstName + this.secondName;
            }
        },
        watchName:{
            chains:"secondName",
            code:function(){
                if(secondName == null || secondName == ""){
                    secondName = "Give me a Name!";
                }
            }
        },
        beforeDelete:function(){

        },
        afterDelete:function(){

        },
        query:{
            lang:"sql",
            params:"personId",
            typeName:"Person",
            value:"select * from Person p where p.id={personId}"
        }
    }
);



