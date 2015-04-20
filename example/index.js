
    var $div = document.querySelector('#pointer');
    var $console = document.querySelector('#console');

    var gesture = new GestureTracker($div);

    for(var eventName in gesture.GESTURE_EVENTS){
        $div.addEventListener(gesture.GESTURE_EVENTS[eventName], function (event) {
            $console.innerHTML = getTime()+': '+event.type+ '\n'+ $console.innerHTML;
        }, false);
    }

    function getTime() {
        var currentdate = new Date();
        return ((currentdate.getHours()<10) ? "0"+currentdate.getHours() : currentdate.getHours()) + ":"
            + ((currentdate.getMinutes()<10) ? "0" + currentdate.getMinutes() : currentdate.getMinutes())+":"
            + ((currentdate.getSeconds()<10) ? "0"+currentdate.getSeconds() : currentdate.getSeconds());
    }

    function onChange(){
        gesture.setDoubleGuardState(document.getElementById('checkbox').checked);
    }
