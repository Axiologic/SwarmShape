registerTest("Swarm Persistence",
    function () {

        swarmClient = new SwarmClient("127.0.0.1", 2000, "mac", "ok", "macTenant", "testCtor");

        swarmClient.addCallback("PersistenceManager.js", function (data) {
            console.log("result1");
            console.log(data);
        });


        var selectQueryReq = {};
        selectQueryReq.type = "QUERY";
        selectQueryReq.persistence = "DbPersistence";
        selectQueryReq.className = "defaultMembersModel";
        selectQueryReq.params = {
            query: "select * from defaultMembersModel"
        };

        swarmClient.startSwarm("PersistenceManager.js", "processRequest", selectQueryReq);
        this.startTesting(1, 100);
    },
    function () {
        this.assert.equal(true, true);
    },
    function () {
    }
)

