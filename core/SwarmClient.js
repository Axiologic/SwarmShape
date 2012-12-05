/**
 * User: sinica
 * Date: 2/12/12
 * Time: 5:03 PM
 */

/*
 Utilities class for connecting from browser to SwarmESB using web-sockets
 */

/**
 * Create a SwarmClient
 * @param serverUrl
 * @param user
 * @param pass
 * @param tenantId
 * @param secure: use SSL
 * @return {SwarmClient}
 */


/**
 *  Create a socket and wrap it as a swarm client providing login, startSwarm,etc
 * @param host
 * @param port
 * @param user
 * @param pass
 * @param tenantId
 * @constructor
 */

function SwarmClient ( hostUrl, user, pass, tenantId, secure) {
    var pendingCmds   = new Array();
    var user = user;
    var pass = pass;
    var tenantId = tenantId;
    var socket = io.connect(host);
    //TODO: add https support
    var sessionId = null;
    makeEventEmitter(this);

    socket.on('identity', function (data) {
        this.sessionId  = data.meta.sessionId;
        this.login(data.meta.sessionId, this.user, this.pass);
        //socket.emit('my other event', { my: 'data' });
    });

    socket.on('sessionId', function (data) {
        sessionId  = data.meta.sessionId;
    });

    socket.on('authenticated', function (data) {
        sessionId  = data.meta.sessionId;
        for (var i = 0; i < pendingCmds.length; i++) {
            pendingCmds[i].meta.sessionId = sessionId;
            dprint("Writing pending command " + J(pendingCmds[i]));
            socket.emit('start', pendingCmds[i]);
        }
        this.pendingCmds = null;
        data.type = "authenticated";
        this.emit(data);
    });

    socket.on('swarm', function (data) {
        data.type = data.meta.swarmingName;
        this.emit(data);
    });

    socket.on('close', function (data) {
        shapePubSub.pub(this,"close");
    });


    /**
     * @param swarmName
     * @param constructor
     */
    this.startSwarm = function (swarmName, constructor) {
        var args = Array.prototype.slice.call(arguments,2);
        var cmd = {
            meta                    :{
                sessionId           : this.sessionId,
                tenantId            : this.tenantId,
                swarmingName        : swarmName,
                command             : "start",
                ctor                : constructor,
                commandArguments    : args
            }
        };
        if(pendingCmds == null) {
            socket.emit('start', cmd);
        }
        else {
            dprint("Preserving pending command " + J(cmd));
            pendingCmds.push(cmd);
        }
    }


    /**
     *
     * @param remoteAdapter
     * @param swarmName
     * @param constructor
     */
    this.startRemoteSwarm = function (remoteAdapter, swarmName, constructor) {
        var args = []; // empty array
        // copy all other arguments we want to "pass through"
        for(var i = 3; i < arguments.length; i++){
            args.push(arguments[i]);
        }
        this.startSwarm("startRemoteSwarm.js","start", remoteAdapter, sessionId, swarmName, constructor, null, args);
    }

    /**
     *
     * @param sessionId
     * @param user
     * @param pass
     */
     function login(sessionId,user,pass) {
        var cmd = {
            meta                :{
                sessionId           : sessionId,
                tenantId            : this.tenantId,
                swarmingName        : "login.js",
                command             : "start",
                ctor                : swarmSettings.authentificationMethod,
                commandArguments    : [sessionId, user, pass]
            }
        };
        socket.emit('start', cmd);
    }
}