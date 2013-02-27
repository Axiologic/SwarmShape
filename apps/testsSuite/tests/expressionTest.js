registerTest("Testing expressions",
    function(){
        this.father = shape.newTransientObject("SpaghettiMonster", "I'm your father!");
        this.son = shape.newTransientObject("SpaghettiMonster", "Luke", this.father);
        this.start(1,1000);
    },
    function(){
            this.assert.equal("Luke...!I'm your father!",this.son.familySecret);
    },
    function(){
        shape.delete(this.father);
        shape.delete(this.son);
    }
)
