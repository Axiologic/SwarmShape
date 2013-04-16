registerTest("Testing local persistence",
    function(){
        shape.setPersistenceForClass("SpaghettiMonster", "local");
        var theFirstOne = shape.lookup("SpaghettiMonster", "theFirstOne");
        shape.delete(theFirstOne);
        this.grandpa = shape.lookup("SpaghettiMonster", "Luke... I'm your father!");
        this.grandpa.name = "Luke's father";
        this.father = shape.newEntity("SpaghettiMonster", "Luke", this.grandpa);
        this.startTesting(4,100);
    },
    function(){
        var queryView = new QueryView("SpaghettiMonster");
        queryView.query("*","SpaghettiMonster");
        queryView.on("end", function (){
            this.assert.equal(queryView.length,2);

            this.assert.equal(this.father.father.getPK(),"Luke's father");

            var ff = shape.lookup("SpaghettiMonster", "Luke's father");

            this.assert.equal(this.father.father,ff);

            if(queryView.getAt(0) == this.grandpa ){
                this.assert.equal(this.father,queryView.getAt(1));
            } else{
                if(queryView.getAt(0) == this.father){
                    this.assert.equal(this.grandpa,queryView.getAt(1));
                } else{
                    this.assert.equal(true,false, "Found unknown garbage in the local persistence");
                }
            }
        });

        //this.assert.equal(luke.father,this.grandpa);
    },
    function(){
        shape.delete(this.father);
        shape.delete(this.grandpa);
        shape.lookup("SpaghettiMonster", "theFirstOne");
        shape.setPersistenceForClass("SpaghettiMonster", null);
    }
)
