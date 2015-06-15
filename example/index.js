var $div = document.querySelector('#pointer');
var $console = document.querySelector('#console');
var pointer = new PointerTracker($div);
var gesture = new GestureTracker($div);
for (var eventName in gesture.GESTURE_EVENTS) {
  $div.addEventListener(gesture.GESTURE_EVENTS[eventName], function (event) {
    var $eventElement = document.createElement('div');
    $eventElement.innerHTML = getTime() + ': ' + event.type;
    $console.insertBefore($eventElement, $console.firstChild);
    console.log(event);
  }, false);
}

//$div.addEventListener(_gesture.GESTURE_EVENTS.pinch, function (event) {
////    var $eventElement = document.createElement('div');
////    $eventElement.innerHTML = getTime() + ': ' + event.type;
////    $console.insertBefore($eventElement, $console.firstChild);
// // if (event.action !== _gesture.GESTURE_ACTIONS.panmove)
//  {
//    console.log(event);
//  }
//}, false);

function getTime() {
  var currentdate = new Date();
  return ((currentdate.getHours() < 10) ? "0" + currentdate.getHours() : currentdate.getHours()) + ":"
    + ((currentdate.getMinutes() < 10) ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + ":"
    + ((currentdate.getSeconds() < 10) ? "0" + currentdate.getSeconds() : currentdate.getSeconds());
}
function onChange() {
  gesture.setDoubleGuardState(document.getElementById('checkbox').checked);
}
