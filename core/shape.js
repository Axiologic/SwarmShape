/*
  Framework's main class:
   Features:
     1. register dependencies: controllers, models, views (shape urls) and custom attributes plugins
     2. create objects (transient, global): newObject, newTransient
     3. shaping DOM functions:

 3.0 expandShapeComponent = function(domObj, parentCtrl, rootModel): expand a tag with shape-view attribute
 3.1 expandExistingDOM = function(domElem,parentCtrl,rootModel): do bindings and shape expansions on existing DOM elements


 */
function Shape(){
    var shape = this;

    var shapeLocaleRegistry = {};

    ShapeUtil.prototype.initUtil();
    ShapeUtil.prototype.initRepositories();
    ShapeUtil.prototype.initSchemaSupport();
    ShapeUtil.prototype.initDOMHandling();
    ShapeUtil.prototype.initPersistences();


    function mergeInRepository(repo, key, newValues){
        if(repo[key]==undefined){
            repo[key] = {};
        }

        for(var newKey in newValues){
            if(repo[key][newKey]!=undefined){
                wprint("Overwriting key "+ newKey);
            }
            //in some cases a full cloning could be more appropriate
            repo[key][newKey] = newValues[newKey];
        }
    }


    this.registerLocale = function(language, dictionary){
        mergeInRepository(shapeLocaleRegistry, language, dictionary);
    }

    this.getLocaleKey = function(key, language){
        if(language==undefined){
            language = this.currentLanguage;
        }
        var lang = shapeLocaleRegistry[language];
        if(lang){
            return lang[key];
        }
        return undefined;
    }

    this.currentLanguage ="en";
    this.languageDebug   = false;

    /*
        Main public functions of shape are (not declared here but added by init functions):
     newEntity(className,args)    : create a persistent object
     newTransient(className,args) : create a transient object
     lookup(className, pk)        : lookup in persistence after an existing object (with PK)
     */

    this.alert = function(message, okHandler, cancelHandler){
        //look in body, add child,etc...
    }
}

window.shape = new Shape();
shape = window.shape;

function getBaseUrl(){
    if(shape.baseUrl  == undefined){
        var l = window.location;
        shape.baseUrl = l.protocol + "//" + l.host + "/" + l.pathname.split('/')[1];
    }
    return shape.baseUrl;
}


//cprint("Loading shape...");

function UrlHashChange(obj){
    this.type=SHAPEEVENTS.URL_CHANGE;
    for(var prop in obj){
        if(prop!= "type"){
            this[prop]=obj[prop];
        }else{
            wprint("Sorry dude, \"type\" is a keyword for hash fragments in Shape's URLs!");
        }
    }
}

function watchHashEvent(ctrl){
    function handler(e){
        var fragment = window.location.hash;
        var index = fragment.indexOf("#");
        if(index == -1) {
            fragment = "";
        } else{
            fragment = fragment.substr(index+1);
        }
        ctrl.emit(new UrlHashChange(fragmentToObject(fragment)));
    }
    $(window).bind('hashchange', handler);
    handler(null);
}

function navigateUsingObject(obj){
    window.location.hash = objectToFragment(obj);
}

L = function(key){
    try{
        var text = shape.getLocaleKey( key);
    }catch(err){
        //hoho
    }
    if(text==undefined){
        if(shape.languageDebug){
            console.log("No localisation for:", key);
        }
        text = key;
    }
    return text;
}