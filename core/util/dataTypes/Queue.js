function ShapeQueue() {
    var items = [];
    this.enqueue = function(item, urgency, total) {

        if(total < 5){
            items.splice(urgency,0,item);
        } else {
            items.push(item);
        }
    }

    this.head = function(item) {
        items.unshift(item);
    }

    this.dequeue = function() {
        return items.shift();
    }

    this.peek = function(){
        return items[0];
    }

    this.length = function(){
        if(items){
            return items.length;
        }
        return 0;
    }
}
