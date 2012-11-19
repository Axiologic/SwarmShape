
registerModel("todo",{
        meta:{
            persitence:"none"
        },
        ctor:function(){
          this.current = this.active;
        },
        active:{
            type:"collection",
            contains:"task"
        },
        completed:{
            type:"collection",
            contains:"task"
        },
        current:{
            type:"collection",
            value:"null"
        },
        newTitle:{
            type:"string"
        },
        recentTask:{
            type:"task",
            value:"null"
        },
        pluralizer:{
            chains:"todoCount",
            code:function(){
                if(this.todoCount == 1){
                    return "";
                } else {
                    return "(s)";
                }
            }
        },
        todoCount:{
            chains:"active",
            code:function(){
                return this.active.length;
            }
        },
        completedCount:{
            chains:"complete",
            code:function(){
                return this.completed.length;
            }
        },
        query:{
            lang:"sql",
            params:"personId",
            typeName:"Person",
            value:"select * from Tasks p where p.id={personId}"
        }
    }
);



