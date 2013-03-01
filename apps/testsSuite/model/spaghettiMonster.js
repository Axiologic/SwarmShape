shape.registerModel("SpaghettiMonster",{
    meta:{
        persistence:"null",
        pk:"name"
    },
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
            if(this.father!=undefined){
                return this.name+"...!"+this.father.name;
            }
        }
    }
});