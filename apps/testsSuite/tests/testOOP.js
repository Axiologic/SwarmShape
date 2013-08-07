
function Person(name) {
    this.setName = function (newName) {
        name = newName;
    }
    this.sayHello = function () {
        return "Person " + this.getName() + " say hello.";
    }

    this.getName = function () {
        return name;
    }
}

Class("Doctor",Person, function (specializare, name) {
    this.getName = function () {
        return "Dr. " + specializare + " "+ this.super.Person.getName();
    }
    this.super.Person(name);
});


Class("Goctor",Doctor, function (specializare, name, grad) {

    this.sayHello = function () {
        return "goctor " + this.getName() + " grad " + grad;
    }
    this.super.Doctor(specializare, name);
});

registerTest("Testing oop",
    function(){
        this.d1 = new Doctor("ORL", "d1");
        this.g1 = new Goctor("GOGU", "G1");
        this.startTesting(2,10);
    },
    function(){
        var self = this;
        self.assert.equal(this.d1.getName(),"Dr. ORL d1");
        self.assert.equal(this.g1.getName(),"goctor. GOGU grad G1");
    },
    function(){
        delete this.d1;
        delete this.g1;
    }
)





