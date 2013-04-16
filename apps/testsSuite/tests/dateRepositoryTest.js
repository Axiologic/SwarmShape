registerTest("Testing data repository",
    function(){
        this.grandpa = shape.lookup("SpaghettiMonster", "Luke... I'm your father!");
        this.father = shape.newEntity("SpaghettiMonster", "Luke", this.grandpa);
        this.startTesting(1,50);
    },
    function(){
        var luke = shape.lookup("SpaghettiMonster", "Luke");
        this.assert.equal(luke.father,this.grandpa);
        //this.assert.equal(luke.father,this.grandpa);
    },
    function(){
        shape.delete(this.father);
        shape.delete(this.grandpa);
    }
)
