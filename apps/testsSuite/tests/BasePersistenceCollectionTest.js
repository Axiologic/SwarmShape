registerTest("Testing Base Persistence",
    function(){
        this.theFirstOne = shape.lookup("SpaghettiMonster", "theFirstOne");
        this.father = shape.lookup("SpaghettiMonster", "father");
        this.uncle = shape.lookup("SpaghettiMonster", "uncle");
        this.grandFather = shape.lookup("SpaghettiMonster", "grandFather");
        this.theFirstOne.family.push(this.father);
        this.theFirstOne.family.push(this.grandFather);
        this.theFirstOne.family.push(this.uncle);
        this.theFirstOne.father = this.uncle;
        console.log("LOOOOG:" + JSON.stringify(this.theFirstOne.getInnerValues()));
        this.startTesting(3,100);
    },
    function(){
        this.assert.equal(this.theFirstOne.getPK() ,"theFirstOne");
        this.assert.equal(this.theFirstOne.father,this.uncle);
        var json = {"name":"theFirstOne","father":"father"} ;
        BasePersistence.prototype.server2local(this.theFirstOne,json);
        this.assert.equal(this.theFirstOne.father,this.father);
        //this.assert.equal(luke.father,this.grandpa);
    },
    function(){
        shape.delete(this.theFirstOne);
        shape.delete(this.father);
    }
)

