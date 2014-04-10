/**
 obsolete controller for ul, list should be used instead
 */

function fakeAppender(view, elements, size){
    var currentIndex = 0;
    if(!size){
      size = 30;
  }

  function appender(){
      var arr = [];
      var length = elements.length;
      for(var i = 0;i< size && currentIndex < length;i++, currentIndex++){
          arr.push(elements[currentIndex]);
      }

      var fragment = document.createDocumentFragment();
      var i = 0;
      while(i < arr.length){
          fragment.appendChild(arr[i]);
          i++;
      }
      view.append(fragment);
      if(currentIndex < length){
          ShapeUtil.prototype.executeNext(appender, 1,1);
      }
  }

    ShapeUtil.prototype.executeNext(appender, 0, 1);
}


var ulCtrl = {
    beginExpansion:function(){
        this.domCache = new DOMCache();
        var self = this;
        this.expander(function(){
            self.afterExpansion(self);
        });
    },
    init:function(){
        this.myView = $(this.view);
    },
    expander:function(callback){
        var view = $(this.view);

        var selfCtrl = this;
        if(this.model){
            this.domCache.doRefresh( this.model, this,
                function(){
                    //view.detachTemp();
                    this.profiler = new ShapeProfiler("List");
                    view.children().each(function(){$(this).detach()});
                },
                function(newElement){
                    this.profiler.step();
                    //$(newElement).appendTo(view);
                },
                function(elements){
                    this.profiler.stop();
                    if(elements){
                        fakeAppender(view, elements);
                        //view.append(elements);
                    }
                    //view.reattach();
                    callback();
                }
            );
        }else{
            callback();
        }
    },
    toView:function(){
        //console.log("UL list: model changed");
        var self = this;
        this.expander(function(){
            self.afterChildExpansion(self);
        });
    }
};

shape.registerCtrl("base/ul",ulCtrl);
shape.registerCtrl("list",ulCtrl);
