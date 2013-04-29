var testRegistry = shape.newTransient("TestViewModel");

function registerTest(description, prepare, run, clean){
    var test = shape.newTransient("TestDescription", description, prepare, run, clean);
    testRegistry.tests.push(test);
}

function runTests(){
    for(var i=0; i<testRegistry.tests.length; i++){
        testRegistry.tests.getAt(i).passed = undefined;
        testRegistry.passedTests.removeAll();
        testRegistry.failedTests.removeAll();
    }
    testRegistry.currentIndex = -1;
    runNextTest();
}

function runNextTest(){
    testRegistry.currentIndex++;
    var runningTest = testRegistry.tests.getAt(testRegistry.currentIndex);
    if(runningTest){
        try{
            shapePubSub.blockCallBacks();
            runningTest.prepare();
            shapePubSub.releaseCallBacks();
            runningTest.__timer = setTimeout(function(){
                assertEndTestVerification(runningTest);
            },runningTest.timeout);
            shapePubSub.afterAllEvents(runningTest.run.bind(runningTest));
        } catch(error){
            assertEndTestVerification(runningTest, "Unknown exception:"+ error)
        }
    }
}

function assertEndTestVerification(runningTest, failCause){
    function testFail(failCause){
        runningTest.failedTests.push(failCause);
        runningTest.testPassed = false;
        testRegistry.failedTests.push(runningTest);
        runningTest.clean();
    }

    function testPass(){
        runningTest.testPassed = true;
        testRegistry.passedTests.push(runningTest);
        runningTest.clean();
    }

    if(failCause != undefined){
        testFail(failCause);
    }
    else{  //timeout passed
        if(runningTest.passed == runningTest.expectedAsserts && runningTest.failedTests.length == 0) {
            testPass();
        } else{
            testFail("Test failed because of timeout ");
        }
    }
    clearTimeout(runningTest.__timer);
    runNextTest();


}

shape.registerModel("TestDescription",{
    ctor:function(name, prepare, run, clean){
        this.name = name;
        this.prepare = prepare;
        this.run = run;
        this.clean = clean;
        this.assert = {};
        this.assert.runningTest = this;
        this.failedTests = this.newObject("collection");

        // Assert functions
        this.assert.equal = function(expectedValue, testedValue , text){
            if(expectedValue != testedValue){
                var logText = "Failed equal assert between "+ expectedValue+ " and " + testedValue + " at:\n" + shape__prettyStack();
                if(text){
                    logText = text + "\n" + logText;
                }
                this.failedTests.push(logText);
                console.log("Failed " + logText);
            } else{
                this.passed++;
                console.log("Passed");
            }
            //assertEndTestVerification(this);
        }.bind(this);

        this.assert.identical = function(expectedValue, testedValue , text){
            if(!ShapeUtil.prototype.identical(expectedValue,testedValue)){
                var logText = "Failed identity assert between "+ expectedValue+ " and " + testedValue + " at:\n" + shape__prettyStack();
                if(text){
                    logText = text + "\n" + logText;
                }
                this.failedTests.push(logText);
                console.log("Failed " + logText);
            } else{
                this.passed++;
                console.log("Passed");
            }
            //assertEndTestVerification(this);
        }.bind(this);
    },
    name:{
        type:"string"
    },
    selected:{
        type:"boolean",
        value:true
    },
    failedTests:{
        type:"collection"
    },
    passed:{
        type:"int"
    },
    testPassed:{
        type:"boolean",
        value:undefined
    },
    prepare:{
        type:"function"
    },
    run:{
        type:"function"
    },
    clean:{
        type:"function"
    },
    expectedAsserts:{
        type:"int"
    },
    startTesting:function(expectedAsserts, timeout){
        this.passed = 0;
        this.testPassed = undefined;
        this.expectedAsserts = expectedAsserts==undefined?1:expectedAsserts;
        this.failedTests.removeAll();
        this.timeout = timeout==undefined?1000:timeout;
    },
    colour:{
        chains:"testPassed",
        code:function(){
            if(this.testPassed == undefined){
                return "grey"
            }
            if(this.testPassed ){
                return "green"
            } else{
                return "red";
            }
        }
    }
});