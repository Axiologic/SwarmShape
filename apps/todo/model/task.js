
shape.registerModel("task",{
        meta:{
            table:"Task",
            pk:"id"
        },
        id:{
            type:"int"
        },
        description:{
            type:"string",
            value:"NoNamed"
        },
        completed:{
            type:"boolean",
            value:false
        }
    }
);



