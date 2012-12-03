
shape.registerModel("echo",
    {
        user:{
            type:"string",
            value:"test"
        },
        pass:{
            type:"string",
            value:"a"
        },
        tenant:{
            type:"string",
            value:"testTenant"
        },
        loggedIn:{
            type:"boolean",
            value:false
        },
        notLoggedIn:{
            chains:"loggedIn",
            code:function(){
                return !this.notLoggedIn;
            }
        },
        input:{
            type:"string",
            value:""
        },
        output:{
            type:"string",
            value:"nothing from server"
        }
    }
);



