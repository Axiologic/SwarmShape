/**********************************************************************************************
 * DataBasePersistence
 **********************************************************************************************/
function DbPersistence(spaceName) {
    var dbPersistenceSwarmName = "PersistenceManager.js";
    var dbPersistenceName = "DbPersistence";
    var swarmClient;
    var commands = [];
    var self = this;
    var customHandlers = {};
    var timerId = null;

    var init = function () {
        makeEventEmitter(self);

        //TODO : get swarmClientInstance from another class( ex: AuthenticationManager )
        swarmClient = new SwarmClient("127.0.0.1", 2000, "mac", "ok", "macTenant", "testCtor");
        swarmClient.addCallback(dbPersistenceSwarmName, function (data) {
            self.proccessChange(data);
        });


        //TODO : refactor this somehow
        customHandlers['create'] = onCreate;
        customHandlers['drop'] = onDrop;
        customHandlers['update'] = onUpdate;
        customHandlers['delete'] = onDelete;
        customHandlers['put'] = onPut;
        customHandlers['get'] = onGet;
    }


    this.proccessChange = function (data) {
        var requestHandler = customHandlers[data.request.type.toLowerCase()];
        if (requestHandler) {
            try {
                requestHandler(data);
            } catch (e) {
            }
        }
        self.emit({type: 'RESULT', data: data});
    }


    this.create = function (tableName, tableDescription) {
        genericCall('create', tableName, {description: tableDescription});
    }
    var onCreate = function (data) {
    }

    this.drop = function (tableName) {
        genericCall('drop', tableName);
    }
    var onDrop = function (data) {
    }


    this.put = function (tableName, data) {
        genericCall('put', tableName, {data: data});
    }
    var onPut = function (data) {
    }


    this.update = function (tableName, id, data) {
        genericCall('update', tableName, {id: id, data: data});
    }
    var onUpdate = function (data) {
    }


    this.get = function (tableName, id) {
        genericCall('get', tableName, {id: id});
    }
    var onGet = function (data) {
    }


    this.delete = function (tableName, id, data) {
        genericCall('delete', tableName, {id: id, data: data});
    }
    var onDelete = function (data) {
    }


    this.query = function (tableName, query) {
        genericCall('query', tableName, {query: query});
    }
    var onQuery = function (data) {
    }


    var genericCall = function (callType, tableName, params) {
        var req = getRequestObject(tableName, callType);
        req.params = params;
        commands.push(req);

        clearInterval(timerId);
        timerId = setInterval(runCommands, 100);
    }


    var getRequestObject = function (className, type) {
        return request = {
            type: type.toUpperCase(),
            className: className,
            persistence: dbPersistenceName
        };
    }


    var runCommands = function () {
        if (commands.length) {
            swarmClient.startSwarm(dbPersistenceSwarmName, "processRequest", commands);
        }
        commands = [];
        clearInterval(timerId);
        timerId = null;
    }


    init();
}

DbPersistence.prototype = new BasePersistence();
//BasePersistence.prototype.registerPersistence("db", new DbPersistence());

lprint("Initialising basic types and persistence...");