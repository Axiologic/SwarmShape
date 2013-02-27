shape.registerModel("SpaghettiMonster",{
    ctor:function(name, father){
        this.name = name;
        this.father = father;
    },
    name:{
        type:"string"
    },
    father:{
        type:"SpaghettiMonster",
        value:null
    },
    family:{
        type:"collection",
        contains:"SpaghettiMonster"
    },
    prankVictim:{
        type:"SpaghettiMonster",
        value:null
    },
    familySecret:{
        chains:"father.name",
        code:function(){
            return this.name+"...!"+this.father.name;
        }
    }
});