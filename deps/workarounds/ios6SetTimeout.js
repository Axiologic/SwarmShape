
//https://gist.github.com/jpattishall/4180482
/**
 Workaround for iOS 6 setTimeout bug using requestAnimationFrame to simulate timers during Touch/Gesture-based events
 Author: Jack Pattishall (jpattishall@gmail.com)
 This code is free to use anywhere (MIT, etc.)

 Note: UIWebView does not support requestAnimationFrames. If your timer is failing during a scroll event,
 take a look at https://gist.github.com/ronkorving/3755461 for a potential workaround.

 Usage: Pass TRUE as the final argument for setTimeout or setInterval.

 Ex:
 setTimeout(func, 1000) // uses native code
 setTimeout(func, 1000, true) // uses workaround

 Demos:
 http://jsfiddle.net/xKh5m/ - uses native setTimeout
 http://jsfiddle.net/ujxE3/ - uses workaround timers
 */

(function(){
    // Only apply settimeout workaround for iOS 6.0 - 6.0.2 (iOS 6.1+ addresses issue)
    if (!navigator.userAgent.match(/OS 6_0/i)) return;

    // Prevent multiple applications
    if(window.getTimeouts !== undefined) return;

    var TIMERID = 'rafTimer',

        touchTimeouts   = {},
        touchIntervals  = {},

    /* Reference to original timers */
        _st = window.setTimeout,
        _si = window.setInterval,
        _ct = window.clearTimeout,
        _ci = window.clearInterval,

    /* Request animation timers */
        _clearTouchTimer = function(uid, isInterval){
            var interval = isInterval || false,
                timer = interval ? touchIntervals :  touchTimeouts;
            if(timer[uid]) {
                timer[uid].callback = undefined;
                timer[uid].loop = false;
                return true;
            } else {
                return false;
            }
        },
        _touchTimer = function(callback, wait, isInterval){
            var uid,
                name = callback.name || TIMERID + Math.floor(Math.random() * 1000),
                delta = new Date().getTime()+ wait,
                interval = isInterval || false,
                timer = interval ? touchIntervals :  touchTimeouts;

            uid = name + "" + delta;

            timer[uid] = {};
            timer[uid].loop = true;
            timer[uid].callback = callback;

            function _loop() {
                var now = new Date().getTime();
                if (timer[uid].loop !== false) {
                    timer[uid].requestededFrame = webkitRequestAnimationFrame(_loop);
                    timer[uid].loop = now <= delta;
                } else {
                    if(timer[uid].callback) timer[uid].callback();
                    if(interval){
                        delta = new Date().getTime() + wait;
                        timer[uid].loop = now <= delta;
                        timer[uid].requestedFrame = webkitRequestAnimationFrame(_loop);
                    } else {
                        delete timer[uid];
                    }
                }
            };

            _loop();
            return uid;
        },
        _timer = function(callback, wait, touch, isInterval){
            if(touch){
                return _touchTimer(callback, wait, isInterval);
            } else {
                return isInterval ? _si(callback, wait) : _st(callback, wait);
            }
        },
        _clear = function(uid, isInterval){
            if(uid && uid.indexOf && uid.indexOf(TIMERID) > -1){
                return _clearTouchTimer(uid, isInterval);
            } else {
                return isInterval ? _ci(uid) : _ct(uid);
            }
        };

    /* Returns raf-based timers; For debugging purposes */
    window.getTimeouts = function(){
        return { timeouts: touchTimeouts , intervals : touchIntervals }
    };

    /* Exposed globally */
    window.setTimeout = function(callback, wait, touch){
        return _timer(callback, wait, touch);
    };
    window.setInterval = function(callback, wait, touch){
        return _timer(callback, wait, touch, true);
    };
    window.clearTimeout = function(uid){
        return _clear(uid);
    };
    window.clearInterval = function(uid){
        return _clear(uid, true);
    };
})();

/*          //alternative from  https://gist.github.com/ronkorving/3755461
if(shape_workaround_ios6_setTimeout){
    (function (window) {
        // This library re-implements setTimeout, setInterval, clearTimeout, clearInterval for iOS6.
        // iOS6 suffers from a bug that kills timers that are created while a page is scrolling.
        // This library fixes that problem by recreating timers after scrolling finishes (with interval correction).
        // This code is released in the public domain. Do with it what you want, without limitations. I do not promise
        // that it works, or that I will provide support (don't sue me).
        // Author: rkorving@wizcorp.jp

        var timeouts = {};
        var intervals = {};
        var orgSetTimeout = window.setTimeout;
        var orgSetInterval = window.setInterval;
        var orgClearTimeout = window.clearTimeout;
        var orgClearInterval = window.clearInterval;


        function createTimer(set, map, args) {
            var id, cb = args[0], repeat = (set === orgSetInterval);

            function callback() {
                if (cb) {
                    cb.apply(window, arguments);

                    if (!repeat) {
                        delete map[id];
                        cb = null;
                    }
                }
            }

            args[0] = callback;

            id = set.apply(window, args);

            map[id] = { args: args, created: Date.now(), cb: cb, id: id };

            return id;
        }


        function resetTimer(set, clear, map, virtualId, correctInterval) {
            var timer = map[virtualId];

            if (!timer) {
                return;
            }

            var repeat = (set === orgSetInterval);

            // cleanup

            clear(timer.id);

            // reduce the interval (arg 1 in the args array)

            if (!repeat) {
                var interval = timer.args[1];

                var reduction = Date.now() - timer.created;
                if (reduction < 0) {
                    reduction = 0;
                }

                interval -= reduction;
                if (interval < 0) {
                    interval = 0;
                }

                timer.args[1] = interval;
            }

            // recreate

            function callback() {
                if (timer.cb) {
                    timer.cb.apply(window, arguments);
                    if (!repeat) {
                        delete map[virtualId];
                        timer.cb = null;
                    }
                }
            }

            timer.args[0] = callback;
            timer.created = Date.now();
            timer.id = set.apply(window, timer.args);
        }


        window.setTimeout = function () {
            return createTimer(orgSetTimeout, timeouts, arguments);
        };


        window.setInterval = function () {
            return createTimer(orgSetInterval, intervals, arguments);
        };

        window.clearTimeout = function (id) {
            var timer = timeouts[id];

            if (timer) {
                delete timeouts[id];
                orgClearTimeout(timer.id);
            }
        };

        window.clearInterval = function (id) {
            var timer = intervals[id];

            if (timer) {
                delete intervals[id];
                orgClearInterval(timer.id);
            }
        };

        window.addEventListener('scroll', function () {
            // recreate the timers using adjusted intervals
            // we cannot know how long the scroll-freeze lasted, so we cannot take that into account

            var virtualId;

            for (virtualId in timeouts) {
                resetTimer(orgSetTimeout, orgClearTimeout, timeouts, virtualId);
            }

            for (virtualId in intervals) {
                resetTimer(orgSetInterval, orgClearInterval, intervals, virtualId);
            }
        });

    }(window));
}              */

