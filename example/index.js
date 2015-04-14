document.addEventListener('DOMContentLoaded', function () {
    var $div = document.querySelector('div');
    gesture = new GestureTracker($div);

    var doubleguard = function (callback) {
        return function (e) {
            var delay = 1000;
            var self = this;
            var timoutID;

            function doublelistener() {
                clearTimeout(timoutID);
                   self.removeEventListener('doubleclick', doublelistener);
            }

            // attach to element doubleclick listener
            this.addEventListener('doubleclick', doublelistener, false);

            // delay callback
            timoutID = setTimeout(function () {
                self.removeEventListener('doubleclick', doublelistener);
                callback.apply(self, e);
            }, delay);
        };
    };

    $div.addEventListener('click', doubleguard(function(){console.log(this)}), false);

    $div.addEventListener('doubletap', function () {
        console.log('doubletap');
    });
    $div.addEventListener('longtap', function () {
        console.log('longtap');
    });
    $div.addEventListener('tap', function () {
        console.log('tap');
    });
}, false);