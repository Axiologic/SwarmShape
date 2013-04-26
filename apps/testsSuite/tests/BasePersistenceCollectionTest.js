registerTest("Testing Base Persistence for collections",
    function(){
        this.theFirstOne = shape.lookup("SpaghettiMonster", "theFirstOne");
        this.father = shape.lookup("SpaghettiMonster", "father");
        this.uncle = shape.lookup("SpaghettiMonster", "uncle");
        this.grandFather = shape.lookup("SpaghettiMonster", "grandFather");

        this.theFirstOne.createMember("family");

        this.theFirstOne.family.push(this.father);
        this.theFirstOne.family.push(this.grandFather);
        this.theFirstOne.family.push(this.uncle);

        console.log("LOG:" + JSON.stringify(this.theFirstOne.getInnerValues()));
        this.startTesting(1,100);
    },
    function(){
        var inner = this.theFirstOne.getInnerValues();
        this.assert.identical(inner.family, ["father","grandFather", "uncle"]);

        /*this.assert.equal(this.theFirstOne.father,this.uncle);
        var json = {"name":"theFirstOne","father":"father"} ;
        BasePersistence.prototype.server2local(this.theFirstOne,json);
        this.assert.equal(this.theFirstOne.father,this.father);
        //this.assert.equal(luke.father,this.grandpa); */
    },
    function(){
        shape.delete(this.theFirstOne);
        shape.delete(this.father);
    }
)

