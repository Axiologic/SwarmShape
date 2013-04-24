registerTest("Testing chain bindings",
    function(){
        this.grandpa = shape.newTransient("SpaghettiMonster", "Luke... I'm your father!");
        this.father = shape.newTransient("SpaghettiMonster", "Luke", this.grandpa);
        this.nephew = shape.newTransient("SpaghettiMonster", "Bau", this.father);

        /*this.father.family.push(this.nephew);
        this.father.family.push(this.grandpa);
        this.nephew.family.push(this.father);
        this.nephew.family.push(this.grandpa); */

        this.nephew.father.prankVictim = this.grandpa;
        this.nephew.father.prankVictim.prankVictim = this.nephew;
        this.nephew.prankVictim = this.father;
        this.startTesting(1,50);
    },
    function(){
        var self = this;
        var testFunction = function(model, prop, value){
            self.assert.equal(value,self.father);
        };
        var watcher = addChangeWatcher(this.nephew, "father.prankVictim.prankVictim.prankVictim", testFunction);
    },
    function(){
        shape.delete(this.father);
        shape.delete(this.grandpa);
        shape.delete(this.nephew);
    }
)
