var testRegistry = shape.newTransient("TestViewModel");

function registerTest(description, prepare, run, clean){
    var test = shape.newTransient("TestDescription", description, prepare, run, clean);
    testRegistry.tests.push(test);
}

function runTests(){
    for(var i=0; i<testRegistry.tests.length; i++){
        testRegistry.tests.getAt(i).passed = undefined;
        testRegistry.passedTests.removeAll();
        testRegistry.failledTests.removeAll();
    }
    testRegistry.currentIndex = -1;
    runNextTest();
}

function runNextTest(){
    testRegistry.currentIndex++;
    var runningTest = testRegistry.tests.getAt(testRegistry.currentIndex);
    if(runningTest){
        try{
            runningTest.prepare();
            runningTest.__timer = setTimeout(function(){
                assertEndTestVerification(runningTest);
            },runningTest.timeout);
            runningTest.run();
        } catch(error){
            assertEndTestVerification(runningTest, "Unknown exception:"+ error)
        }
    }
}

function assertEndTestVerification(runningTest, failCause){
    function testFail(failCause){
        runningTest.failled.push(failCause);
        runningTest.testPassed = false;
        testRegistry.failledTests.push(runningTest);
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
        if(runningTest.passed == runningTest.expectedAsserts && runningTest.failled.length == 0) {
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
        this.assert.equal = function(expectedValue, testedValue){
            if(expectedValue != testedValue){
                var logText = "Failed equal assert between "+ expectedValue+ " and " + testedValue + " at:\n" + shape__prettyStack();
                this.failled.push(logText);
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
    failled:{
        type:"collection"
    },
    passed:{
        type:"int"
    },
    testPassed:{
        type:"boolean",
        value:"undefined"
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
        this.failled.removeAll();
        this.timeout = timeout==undefined?1000:timeout;
    }
});