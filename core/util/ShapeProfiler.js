
function ShapeProfiler(algName){
    var name = algName;
    var counter = 0;
    var startTime = new Date().getTime();
    var diff = 0;


    this.start = function(algName){
        startTime = new Date().getTime();
        if(algName){
            name = algName;
        }
    }

    this.step = function(){
        counter++;
    }

    this.stop = function(noPrint){
        var endTime = new Date().getTime();
        diff = endTime - startTime;
        if(!noPrint){
            this.print();
        }
    }

    this.print = function(returnString){
        var ret = "";
        if(counter){
            ret = "Executing " + counter + " steps";
        }
        ret += " in " + diff + " milliseconds";
        if(!returnString){
            lprint("Profiling " + name + " " + ret);
        }
        return ret;
    }

}
