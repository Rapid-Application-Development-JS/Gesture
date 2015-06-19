var $div = document.querySelector('#pointer');
var $holder = document.querySelector('#holder');
var $console = document.querySelector('#console');
var pointer = new PointerTracker($div);
var gesture = new GestureTracker($div);
var transformTranslate ="";
var flingOptions ={
  x:0,
  y:0
},
  PanOptions ={
    size:0
  },
  angle = 180;

function init()
{
  PanOptions.size = $div.offsetWidth>$div.offsetHeight?$div.offsetHeight/2:$div.offsetWidth/2;
  PanOptions.size = PanOptions.size - $holder.offsetWidth;
  onSingleItemClick();
};

function addLine(event) {
  var $eventElement = document.createElement('div');
  $eventElement.innerHTML = getTime() + ': ' + event.type;
  $console.insertBefore($eventElement, $console.firstChild);
};
//============================================================
//
//============================================================
function rotate(event){
  $holder.style.webkitTransform = 'rotate('+event.angle+'deg)';
  addLine(event);
}

function fling(event){
  $holder.style.transition = 'transform ' + (event.duration / 1000) + "s ease-out";

  flingOptions.x += event.end.clientX - event.start.clientX;
  flingOptions.y += event.end.clientY - event.start.clientY;

  flingOptions.x =  $holder.offsetLeft+$holder.offsetWidth+flingOptions.x > $div.offsetWidth ? $div.offsetWidth - ($holder.offsetLeft+$holder.offsetWidth) : flingOptions.x;
  flingOptions.y = $holder.offsetTop+$holder.offsetHeight+flingOptions.y > $div.offsetHeight ? $div.offsetHeight - ($holder.offsetTop+$holder.offsetHeight): flingOptions.y;

  flingOptions.x = $holder.offsetLeft+flingOptions.x < 0 ? -$holder.offsetLeft : flingOptions.x;
  flingOptions.y = $holder.offsetTop+flingOptions.y < 0 ? -$holder.offsetTop : flingOptions.y;
  transformTranslate = 'translate3d(' + flingOptions.x + 'px, ' + flingOptions.y + 'px, 0)';
  $holder.style.webkitTransform = transformTranslate;
  addLine(event);
};

function tap(event){
  $holder.style.transition = 'transform .1s ease-out';
  $holder.style.webkitTransform = transformTranslate + ' scale(1.2, 1.2)';
  setTimeout( function() {
      $holder.style.webkitTransform =transformTranslate+ 'scale(1, 1)';
    }, 100
  );
  addLine(event);
}

function doubletap(event){
  $holder.style.transition = 'transform .5s ease-out';
  $holder.style.webkitTransform = transformTranslate +' rotateY(' + (angle) + 'deg)';
  if (angle == 0) {
    angle = 180;
  } else {
    angle = 0;
  }
  addLine(event);
}

function pinch(event){
  $holder.style.webkitTransform = transformTranslate + ' scale('+event.zoom+', '+event.zoom+')'
  addLine(event);
}

function pan(event){
  var x= 0, y= 0;
  if(event.action == 'panstart'){
    $holder.style.transition ='';
  }else if(event.action == 'panend'){
    $holder.style.transition ='transform .1s ease-out';
    $holder.style.webkitTransform ="";
  }else {
    switch (event.direction) {
      case 'left':
      case  'right':
        if(Math.abs(event.distanceX)>PanOptions.size){
          var k = Math.abs(event.distanceX)/event.distanceX;
          x =PanOptions.size+(Math.abs(event.distanceX) - PanOptions.size)*(PanOptions.size/Math.abs(event.distanceX));//*(Math.abs(event.distanceX)/event.distanceX));
          x = x*k;
        }else {
          x = event.distanceX;
        }
        y = 0;
        break;
      case 'up':
      case 'down':
        x = 0;
        if(Math.abs(event.distanceY)>PanOptions.size){
          var k = Math.abs(event.distanceY)/event.distanceY;
          y =PanOptions.size+(Math.abs(event.distanceY) - PanOptions.size)*(PanOptions.size/Math.abs(event.distanceY));//*(Math.abs(event.distanceX)/event.distanceX));
          y = y*k;
        }else {
          y = event.distanceY;
        }
        break;
    }
  }
  $holder.style.webkitTransform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
  addLine(event);
}
//============================================================
//
//============================================================
function getTime() {
  var currentdate = new Date();
  return ((currentdate.getHours() < 10) ? "0" + currentdate.getHours() : currentdate.getHours()) + ":"
    + ((currentdate.getMinutes() < 10) ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + ":"
    + ((currentdate.getSeconds() < 10) ? "0" + currentdate.getSeconds() : currentdate.getSeconds());
}
function onChange() {
  gesture.doubleGuardState = document.getElementById('checkbox').checked;
}

function onSingleItemClick(){
  removeEvents();
  $div.addEventListener(gesture.GESTURE_EVENTS.fling, fling, false);
  $holder.addEventListener(gesture.GESTURE_EVENTS.tap, tap, false);
  $holder.addEventListener(gesture.GESTURE_EVENTS.doubletap, doubletap, false);
}

function onPinchItemClick(){
  removeEvents();
  $div.addEventListener(gesture.GESTURE_EVENTS.pinch, pinch, false);
}

function onPanItemClick(){
  removeEvents();
  $div.addEventListener(gesture.GESTURE_EVENTS.pan, pan, false);
}

function onRotateItemClick(){
  removeEvents();
  $div.addEventListener(gesture.GESTURE_EVENTS.rotate, rotate, false);
}

function removeEvents(){
  $holder.style.transition ='transform .1s ease-out';
  $holder.style.webkitTransform = "";
  $div.removeEventListener(gesture.GESTURE_EVENTS.fling, fling, false);
  $holder.removeEventListener(gesture.GESTURE_EVENTS.tap, tap, false);
  $holder.removeEventListener(gesture.GESTURE_EVENTS.doubletap, doubletap, false);
  $div.removeEventListener(gesture.GESTURE_EVENTS.rotate, rotate, false);
  $div.removeEventListener(gesture.GESTURE_EVENTS.pinch, pinch, false);
  $div.removeEventListener(gesture.GESTURE_EVENTS.pan, pan, false);
  $holder.style.transition ='';
}

init();
