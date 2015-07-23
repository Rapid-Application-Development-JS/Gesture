var $div = document.querySelector('#pointer'),
  $holder = document.querySelector('#holder'),
  $checkBox = document.getElementById('checkbox'),
  $header = document.getElementById('header'),
  pointer = new PointerTracker($div),
  gesture = new GestureTracker($div, init),
  PanOptions ={
    size:0
  },
  SingleOptions = {
    angle: 180,
    rotateString: '',
    transformTranslate: '',
    flingOptions: {
      x: 0,
      y: 0
    },
    clear: function(){
      this.angle = 180;
      this.rotateString = '';
      this.transformTranslate = '';
      this.flingOptions.x = 0;
      this.flingOptions.y = 0;
    }
  };

function init()
{
  PanOptions.size = $div.offsetWidth>$div.offsetHeight?($div.offsetHeight/2):($div.offsetWidth/2);
  PanOptions.size = PanOptions.size - $holder.offsetWidth;
  onSingleItemClick();
};

//============================================================
//
//============================================================
function rotate(event){
  $holder.style.webkitTransform = 'rotate('+event.angle+'deg)';
}

function fling(event){
  $holder.style.transition = 'transform ' + (event.duration / 1000) + "s ease-out";

  SingleOptions.flingOptions.x += event.end.clientX - event.start.clientX;
  SingleOptions.flingOptions.y += event.end.clientY - event.start.clientY;

  SingleOptions.flingOptions.x =  $holder.offsetLeft+$holder.offsetWidth+SingleOptions.flingOptions.x > $div.offsetWidth ? $div.offsetWidth - ($holder.offsetLeft+$holder.offsetWidth) : SingleOptions.flingOptions.x;
  SingleOptions.flingOptions.y = $holder.offsetTop+$holder.offsetHeight+SingleOptions.flingOptions.y > $div.offsetHeight ? $div.offsetHeight - ($holder.offsetTop+$holder.offsetHeight): SingleOptions.flingOptions.y;

  SingleOptions.flingOptions.x = $holder.offsetLeft+SingleOptions.flingOptions.x < 0 ? -$holder.offsetLeft : SingleOptions.flingOptions.x;
  SingleOptions.flingOptions.y = $holder.offsetTop+SingleOptions.flingOptions.y < 0 ? -$holder.offsetTop : SingleOptions.flingOptions.y;
  SingleOptions.transformTranslate = 'translate3d(' + SingleOptions.flingOptions.x + 'px, ' + SingleOptions.flingOptions.y + 'px, 0)';
  $holder.style.webkitTransform = SingleOptions.transformTranslate + SingleOptions.rotateString;
};

function tap(event){
  $holder.style.transition = 'transform .1s ease-out';
  $holder.style.webkitTransform = SingleOptions.transformTranslate + ' scale(1.2, 1.2)' + SingleOptions.rotateString;
  setTimeout( function() {
      $holder.style.webkitTransform =SingleOptions.transformTranslate+ 'scale(1, 1)'+ SingleOptions.rotateString;
    }, 100
  );
}

function doubletap(event){
  $holder.style.transition = 'transform .5s ease-out';
  SingleOptions.rotateString = ' rotateY(' + (SingleOptions.angle) + 'deg)';
  $holder.style.webkitTransform = SingleOptions.transformTranslate +SingleOptions.rotateString;
  if (SingleOptions.angle == 0) {
    SingleOptions.angle = 180;
  } else {
    SingleOptions.angle = 0;
  }
}

function pinch(event){
  $holder.style.webkitTransform = SingleOptions.transformTranslate + ' scale('+event.zoom+', '+event.zoom+')'
}

function pan(event){
  var x= 0, y= 0;
  console.log(event.action);
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
  gesture.setDoubleGuardState($checkBox.checked);
}

function onSingleItemClick(){
  removeEvents();
  $div.addEventListener(gesture.GESTURE_EVENTS.fling, fling, false);
  $holder.addEventListener(gesture.GESTURE_EVENTS.tap, tap, false);
  $holder.addEventListener(gesture.GESTURE_EVENTS.doubletap, doubletap, false);
  $holder.addEventListener(gesture.GESTURE_EVENTS.hold, hold, false);
  $checkBox.checked = gesture.getDoubleGuardState();
  $header.style.opacity = 1;
}

function hold(event){
  if(event.action === 'holdstart') {
    $holder.style.backgroundColor = '#FFFF00';
    console.log('hold start catch');
  }else{
    console.log('hold catch');
    $holder.style.backgroundColor = "rgb(40, 142, 223)";
  }
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
  $header.style.opacity = 0;
  $holder.style.transition ='transform 1s ease-out';
  $holder.style.webkitTransform = "";
  SingleOptions.clear();
  $div.removeEventListener(gesture.GESTURE_EVENTS.fling, fling, false);
  $holder.removeEventListener(gesture.GESTURE_EVENTS.tap, tap, false);
  $holder.removeEventListener(gesture.GESTURE_EVENTS.doubletap, doubletap, false);
  $div.removeEventListener(gesture.GESTURE_EVENTS.rotate, rotate, false);
  $div.removeEventListener(gesture.GESTURE_EVENTS.pinch, pinch, false);
  $div.removeEventListener(gesture.GESTURE_EVENTS.pan, pan, false);
  $holder.removeEventListener(gesture.GESTURE_EVENTS.hold, hold, false);
  $holder.style.transition ='';
}

