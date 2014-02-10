   SwarmShape 1.0 (beta): JS MVVM framework 
=====================================================

Why another JS MVVM framework?
  Simple, other JS frameworks are not elegant and powerfull enough: 

* minimal framework conventions, reduce boilerplate 
* very gentle learning curve to become effective (a few hours, days)
* few, natural concepts: bindable chains, watch chains from controllers, html views with bindings and specific attributes like shape-model, shape-ctrl, shape-context, custom attributes. 
* DECLARATIVE: produce disciplined, encapsulated code 
* is like Angular.js in some aspects but provides real MVVM (modify DOM not strings, extend HTML with controllers and atributes, mutiple views)
* TYPED models using an internal JavaScript DSL. Offers dynamic view injection and better error handling
* clear separation between models (bindable properties), views (declarative html) and controllers (allowed to modify DOM elements, implement bindings and custom behaviour)
* inversion of control in a declarative way: automaticaly insert views in DOM using the type of the model

* dynamic controllers: dynamic view injection, you can have multiple views for a model using shape-context attributes 


         <!-- declare a dynamic controller (the view will be injected on the type of model)
         Choose the view using the name of the context (shape-context attribute) or injects 
         default view for user model if the context view doesn't exist -->
         
         <div shape-model="@user" shape-context="notLoggedIn" ></div> 
      
* cached dynamic controllers:  like dynamic controllers but preserves the views for quick switches (tabs, etc)
      
* watch and bind chains (@ means bind relative to current model)


         <!-- instantiate a dynamic controller that automatically change the view at any change in the model 
         eg chain: user.manager.adress -->
         
         <div shape-model="@user.manager.adress" ></div> 

* to create a list you just create a collection and declare an ul bindined to this colection


         <!-- this create html to display a list of results in 'readonly' context -->
         <ul shape-model="@searchResult.list" shape-context="readonly"/>
    

* each view and each controller have a model
* automatic persistence for models (to JSON) with embeded or transient properties
* add arbitrary expressions in html attributes:  value="@user.name == 'John'"
* if you know JQuery, you learn to create a new controller in 10 minutes
* clear arhitecture, you start from views and models and discover your code
* automatically creates controllers as declared in views
* events model that get transmited in the controlers hieracy that mimics the DOM structure
* intuitive event model for autocomputed properties in models and for chains. Compact multiple,related events for speed and soundness.
* VERY GOOD error handling, showing stack info, type informations,etc (wprint, eprint, esprint, etc)

Todo example: https://github.com/salboaie/SwarmShape/tree/master/apps/todo
Guide: start looking in views first and next models, controllers. How they are working toghether should be visible from views and models.

   SwarmShape : JS MVVM framework for REST and Swarms 
=====================================================

SwarmShape is part of "Swarm" project and provides UI components and client side architecture for "Swarmified" applications 
* SwarmESB (https://github.com/salboaie/SwarmESB)  is an Enterprise Service Bus: orchestrates services (REST APIs, or functions)
* SwarmShape is open and extensible. Combined with SwarmESB is powerfull but it can be used with custom servers (your own CRUD, web services)
* SwarmShape is a modern Java Script and HTML5 development framework
 
License: LGPL

Release:  1.0(beta) 
Planned stable release: 1.0

SwarmShape:
* Created for big enterprise projects 
* Real time web applications
* Portals, RIA, single page applications)
* Type checking in Java Script (only for models)
* If you know HTML, you know SwarmShape 
* Rest APIs or SwarmESB for backend
* Goals: simplicity, programming discipline, reusable components, component layouts, themes


Examples:
For the classical TODO example commonly created to show JS frameworks,just checkout this project and point your browser to apps/todo/index.php (php is not really required but an web server is required) 

SwarmShape priciples/features:
  - declarative when possible
  - based on inversion of control
  - reusability of controllers (mainly) and models
  - html tags will magically become components if you put shape-ctrl or shape-view attributes
  - clean separation of models, views, controllers
  - fat models
  - models with type checking (types, interfaces)
  - use computed properties (expression computed from properties chains) to describe self contained models
  - explicitly put as much as possible from your specific logic in models (code and data) and not in behaviors/controllers,views, helper classes
  - everything else get reusable (components, views, controllers, helpers, style, layouts)
  - model objects can be
      - "global" (persistent objects, saved on server, have a global identity)
      - transient (exist only once, don't have an identity)
      - embedded  (embedded in a global object that can be seen as an (JSON) "document", hae only local identity)

  - have magic (like bindings, ChangeWatchers for chains, componentisation) but have as few APIs and concepts as possible
  - when possible, let conventions discover a proper controller or a model for a HTML tags
  - add your custom attributes to any html tag to enhance code readability and do more magic

Main features:
- MVC (MVVM) with clean and simple architecture
- bindable/observable chains and collections
- ui component oriented (yes,you can create reusable components with HTML!)
- client side Pub/Sub channels (safe and sound against asynchronous weirdness in computed values/expressions from  models or in callbacks for other messages/events)
- views are build by direct DOM element manipulation and not with templates (string manipulation)
- reusable layouts (wip)
- works with Ajax and swarms (SwarmESB) for backend (wip)


Quick Code Example:
===============

   Model:

      //declaration of a task class definition
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
     <span id="myTask" shape-context="render" ></span>
      ...
      // create a model (a task), expand that component and bind to the model
      model = shape.newObject("task");
      //insert shape view in DOM based on a root model 
      shape.expandShapeComponent(document.getElementById("main"),null, model)




