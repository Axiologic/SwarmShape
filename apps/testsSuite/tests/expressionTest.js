registerTest("Testing expressions",
    function(){
        this.father = shape.newTransient("SpaghettiMonster", "I'm your father!");
        this.son = shape.newTransient("SpaghettiMonster", "Luke", this.father);
        this.startTesting(1,50);
    },
    function(){
            this.assert.equal("Luke...!I'm your father!",this.son.familySecret);
    },
    function(){
        shape.delete(this.father);
        shape.delete(this.son);
    }
)
