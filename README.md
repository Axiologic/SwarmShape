ShapeJS : MVC framework for big enterprise projects (portals, RIA, single page applications)
=============================================================================================

Goals: simplicity, programming discipline, reusable components, component layouts, themes

Right now: Experimental web interface framework for creating complex RIA applications using Java Script

Our simple rules: 
  - clean separation of models, views, controllers
  - have fat models, feature to describe self contained models (computed properties)
  - explicitly put as much as possible in models (data) and not in behaviors/controllers,views, helper classes
  - everything else get reusable (components, views, controllers, helpers)
  - models can be persistent (you can save on server) or transient (exist only once)
  - html tags can become components if you put shape-ctrl or shape-view attributes 
  - have magic (like bindings, ChangeWatchers for chains, componentisation) but have as few APIs ad concepts as possible
  - when possible, let conventions discover a proper controller or a model for a HTML tags

Main features (in progress):
- MVC (MVVM) with clean and simple architecture
- component oriented (yes, create reusable components with HTML!)
- client side Pub/Sub channels (safe and sound against asynchronous weirdness in computed values/expressions from  models or in callbacks for other messages/events)
- reusable layouts (wip)
- works with Ajax and swarms (SwarmESB) for backend

Quick Example:
=======

   Model:

      //declaration of task class definition
      shape.registerModel("task",{
              meta:{
                  table:"Task", //where to save
                  pk:"id"       // primary key field
              },
              id:{
                  type:"int"
              },
              description:{
                  type:"string",
                  value:""
              },
              completed:{
                  type:"boolean",
                  value:false
              }
          }
      );
      
   View component (registered as task.render):

      <!-- this components is controlled by "todo/taskLine" controller -->
      <div class="view" shape-ctrl='todo/taskLine'>
           <input class="toggle" type="checkbox" shape-model = "@completed" >
           <label shape-model="@description" ></label>
           <button class="destroy" shape-event = "remove"></button>
       </div>

   Controller:
      
      //will take as model a "task"
      shape.registerCtrl("todo/taskLine",{
            count:0,
            init:function(){
                this.oldValue = this.model.completed;
                this.addChangeWatcher("completed", this.completedChanged);
            },
            toView:function(){
                $(this.view).toggleClass("completed", this.model.completed);
                this.oldValue = this.model.completed;
            },
            completedChanged:function(){
                if(this.oldValue != this.model.completed){
                    $(this.view).toggleClass("completed", this.model.completed);
                    this.event("completedToggle",this.model);
                    this.oldValue = this.model.completed;
                }
            }
        });

   And, finally, somewhere in your app: 

      <!-- instantiate a component named "task.render" -->
     <span id="myTask" shape-view="task.render" ></span>

      ...
      // create a model (a task), expand that component and bind to the model
      model = shape.newObject("task")
      shape.expandShapeComponent(document.getElementById("main"),null, model)


