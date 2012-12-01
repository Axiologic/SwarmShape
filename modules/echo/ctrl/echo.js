
shape.registerCtrl("echo",{
    init:function(){
        this.addChangeWatcher("input", this.sendEcho);
    },
    toView:function(){

    },
    action:function(){
        dprint("Login clicked");
        this.model.loggedIn = true;
    },
    sendEcho :function(){
        if( this.model.input != ""){
            dprint("Sending swarm..." + this.model.input);
        }
    }
});
