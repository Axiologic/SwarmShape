/**********************************************************************************************
 * Database Persistence Test
 **********************************************************************************************/

(function () {
    /**********************************************************************************************
     * Model Description
     **********************************************************************************************/
    var modelName = "dbTestModel";
    var modelDescription = {
        meta: {
            persistence: "db",
            pk: "id"
        },
        m_string: {
            type: "string"
        },
        m_number: {
            type: "number"
        },
        m_int: {
            type: "int"
        },
        m_date: {
            type: "date"
            //TODO :  date serialization not working?? maybe a socket.io problem. on nodejs it's ok
        },
        m_boolean: {
            type: "boolean"
        },
        m_collection: {
            type: "collection",
            contains: modelName
        },
        m_embeded: {
            type: modelName
        },
        m_global: {
            type: modelName
        }
        //TODO : add chains
    };


    /**********************************************************************************************
     * Register Model
     **********************************************************************************************/
    shape.registerModel(modelName, modelDescription);


    /**********************************************************************************************
     * Register Test
     **********************************************************************************************/
    var self = this;
    var testContext;
    var tests;
    var currentTest;

    var initFunction = function () {
        testContext = this;
        shape.setPersistenceForClass(modelName, "db");
        testContext.persistence = BasePersistence.prototype.getPersistenceByName('db');

        testContext.persistence.on('RESULT', function (event) {
            var testError;
            var testResult;
            try {
                testResult = getTestHandler()(event.data);
            } catch (e) {
                testError = e;
            }

            if (!testResult || testError) {
                testContext.assert.equal(false, true, "Test failed !" + testError);
            }
            else {
                runNextDbTest();
            }
        });

        testContext.startTesting(1, 100);
    }

    var cleanFunction = function () {
        //testContext.persistence.drop(modelName);
    }


    var createTest = function () {
        testContext.persistence.create(modelName, modelDescription);
    }
    var onCreate = function (data) {
        testContext.assert.equal(data.error, null, "Table" + modelName + " created !");
        return data.error ? false : true;
    }


    var putTest = function () {
        testContext.modelObj = shape.newEntity(modelName);
        testContext.persistence.put(testContext.modelObj.getClassName(), testContext.modelObj.getInnerValues());
    }
    var onPut = function (data) {
        var idSet = data.result.id > 0 ? true : false
        testContext.assert.equal(idSet, true, "Id not set !");
        var m = testContext.modelObj;
        m.setPK(data.result['id']);
        return true;
    }

    var updateData = {
        m_string: "update test",
        m_number: 123.12,
        m_int: 5678,
        m_date: new Date(),
        m_boolean: true,
        m_collection: null,
        m_embeded: null,
        m_global: null
    }

    var updateTest = function () {
        var m = testContext.modelObj;
        for (var key in updateData) {
            m[key] = updateData[key];
        }
        testContext.persistence.update(m.getClassName(), m.getPK(), m.getInnerValues());
    }
    var onUpdate = function (data) {
        for (var key in updateData) {
            testContext.assert.equal(data.result[key], updateData[key]);
        }
        return true;
    }

    var getTest = function () {
        var m = testContext.modelObj;
        testContext.persistence.get(m.getClassName(), m.getPK());
    }
    var onGet = function (data) {
        var m = testContext.modelObj;
        for (var key in data.result) {
            testContext.assert.equal(data.result[key], m[key]);
        }
        return true;
    }

    var getNoCacheTest = function () {
        var m = testContext.modelObj;
        testContext.persistence.get(m.getClassName(), m.getPK());
    }
    var onGetNoCache = function (data) {
        var m = testContext.modelObj;
        for (var key in data.result) {
            testContext.assert.equal(data.result[key], m[key]);
        }
        return true;
    }

    var queryTest = function () {
        var m = testContext.modelObj;
        testContext.persistence.query(m.getClassName(), 'select * from ' + modelName + ';');
    }
    var onQuery = function (data) {
        return true;
    }


    var deleteTest = function () {
    }
    var onDelete = function (data) {
        return true;
    }

    var doneTest = function () {
        console.log("DONE");
    }

    var runFunction = function () {
        tests = [
            ['createTest', createTest, onCreate],
            ['putTest', putTest, onPut],
            ['updateTest', updateTest, onUpdate],
            ['getTest', getTest, onGet],
            ['getNoCacheTest', getNoCacheTest, onGetNoCache],
            ['queryTest', queryTest, onQuery],
            ['doneTest', doneTest]
        ].reverse();
        runNextDbTest();
    }


    registerTest("DataBase Persistence", initFunction, runFunction, cleanFunction);

    /**********************************************************************************************
     * Util functions
     **********************************************************************************************/
    var runNextDbTest = function () {
        currentTest = tests.pop();
        if (currentTest) {
            currentTest[1]();
        }
    }

    var getTestHandler = function () {
        return currentTest[2];
    }

})();
