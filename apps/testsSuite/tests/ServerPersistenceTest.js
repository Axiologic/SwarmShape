registerTest("Swarm Persistence",
    function () {

        this.model = {
            name: "SpaghettiMonster",
            description: {
                name: {
                    type: "string"
                },
                father: {
                    type: "SpaghettiMonster",
                    value: null
                },
                family: {
                    type: "collection",
                    contains: "SpaghettiMonster"
                },
                prankVictim: {
                    type: "SpaghettiMonster",
                    value: null
                }
            }
        };

        shape.setPersistenceForClass("SpaghettiMonster", "db");
        this.persistence = BasePersistence.prototype.getPersistenceByName('db');
        this.startTesting(1, 5000);
    },
    function () {
        test = {
            createTable: function () {
                self.persistence.create(self.model.name, self.model.description);
            },
            put: function (data) {
                grandpa = shape.lookup("SpaghettiMonster", 1);
                grandpa.name = "Luke's father";
                self.persistence.put(grandpa.getClassName(), grandpa.getInnerValues());
            },
            update: function (data) {
                grandpa.setPK(data.result.id);
                grandpa.father = shape.newEntity("SpaghettiMonster", 1, grandpa);
                grandpa.createMember('family');
                grandpa.family.push(shape.newEntity("SpaghettiMonster", 2, grandpa));
                grandpa.family.push(shape.newEntity("SpaghettiMonster", 3, grandpa));
                grandpa.family.push(shape.newEntity("SpaghettiMonster", 5, grandpa));
                self.persistence.update(grandpa.getClassName(), grandpa.getPK(), grandpa.getInnerValues());
            },
            getObject: function (data) {
                self.persistence.get(grandpa.getClassName(), grandpa.getPK());
            },
            done: function (data) {
                self.assert.equal(true, true);
            }
        };
        var grandpa, father;
        var self = this;

        var steps = [test.put, test.update, test.getObject, test.getObject, test.done];

        self.persistence.on('REFRESH', function (event) {
            var result = event ? event.data : event;
            console.log(result);
            if (steps && steps.length) {
                steps.shift()(event.data);
            }
        });

        test.createTable();
    },
    function () {
        this.persistence.drop(this.model.name);
    }
)

