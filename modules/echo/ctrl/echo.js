
shape.registerCtrl("echo",{
    init:function(){
        this.addChangeWatcher("input", this.sendEcho);
    },
    toView:function(){

    },
    action:function(){
        var self = this;
        dprint("Login clicked");
        var serverUrl= 'http://localhost:81';
        this.swclient = new SwarmClient(serverUrl, this.model.user, this.model.pass, this.model.tenantId);
        this.swclient.on("authenticated", function(){
         self.model.loggedIn = true;
        });
    },
    sendEcho :function(){
        if( this.model.input != ""){
            dprint("Sending swarm..." + this.model.input);
        }
    }
});
