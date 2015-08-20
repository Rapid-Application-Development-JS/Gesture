# Gesture
Gesture events are built on top of the W3C Pointer Events model. Use gesture events to help recognize and respond to more complex touch-based user interactions without having to capture and interpret individual pointer events yourself.

This module resolves the issue of delay for click events in mobile browsers. A tap event will be fired immediately when the user lifts the finger.

[Example](http://rapid-application-development-js.github.io/Gesture/example)

---

Now the module provides the following tap events:
- tap
- longtap
- doubletap
- hold
- fling
- pan
- pinch
- rotate
- curve

>**Warning:** Your widgets should broadcast the following events for the correct work of the `Gesture` module:
- pointerup
- pointerdown
- pointermove
- pointerover
- pointercancel

Now these events have native support only in IE 11 and newer versions.
You have to use mouse event wrapper that provides the needed events for working with other browsers. We recommend to use our wrapper called
[Pointer](https://github.com/Rapid-Application-Development-JS/Pointer).

###Gesture events and the GestureTracker object
The first step for handling gestures in your code is to give the gesture a target element. This is the element to which the module will fire gesture events. It is also the element that determines the coordinate space for the events.

```javascript
var $div = document.querySelector('#pointer');
```

Next you should instantiate a gesture with the target element.

```javascript
var gesture = new GestureTracker($div);
```

Finally, subscribe the element to the gesture event.

```javascript
$div.addEventListener("tap", function (event) {
// some code
});
```

`GestureTracker` has an object `GESTURE_EVENTS` that contains string fields with names of gesture events. You can use it to subscribe to these events.

```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.tap, function (event) {
// some code
});
```
####Custom gestures
You can add your custom gesture to the tracker. You should use method `addGesture(gesture)`. This method takes your gesture object (that contains a description of gesture behavior) as the argument. The gesture object must have the following public methods:
```javascript
gesture.pointerDown(event, tracks, callback);
gesture.pointerMove(event, tracks, callback);
gesture.pointerLeave(event, tracks, callback);
gesture.pointerCancel(event, tracks, callback);
gesture.pointerUp(event, tracks, callback);
gesture.pointerOut(event, tracks, callback);
```
`event` - contains information about the pointer event.

`tracks` - contains information about points that are involved in the gesture.

`callback` - callback function must be called to broadcast your event.
```javascript
callback(type, event, options);
```
`type` - event type (name). You will be subscribed to this event name.

`event` - contains information about the pointer event.

`options` - information that will be added to the event object.

#####Example
```javascript
var tapGesture = {
  _isrecognized: false,

  pointerDown: function (event, tracks, callback) {
    this._isrecognized = true;
  },

  pointerMove: function (event, tracks, callback) {
    this._isrecognized = false;
  },

  pointerUp: function (event, tracks, callback) {
    if (this._isrecognized || ((tracks.getTrack(event.pointerId).end.timeStamp - tracks.getTrack(event.pointerId).start.timeStamp) < 300)) {
      callback('tap', event, null);
    }
    this._isrecognized = false;
  },

  pointerCancel: function (event, tracks, callback) {
    this._isrecognized = false;
  },

  pointerLeave: function (event, tracks, callback) {
    this._isrecognized = false;
  },

  pointerOut: function (event, tracks, callback) {
    this._isrecognized = false;
  }
};

gesture.addGesture(tapGesture);
```
###Gestures
####tap
The most basic gesture recognition is a tap. When a tap is detected, the `GesterTraker` event is fired at the target element of the gesture object. Different from the click event, the tap gesture only fires when the user touches (or presses a mouse button, or presses with a stylus pen) down and up without moving. This is useful if you want to differentiate a user tapping on an element versus dragging an element.
####hold
A `hold` gesture happens when the user touches down with one finger and holds it during 350ms without moving.

```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.hold, function (event) {
// some code
});
```

You can change the hold delay by using the field `HOLD_TIMEOUT`.

```javascript
gesture.HOLD_TIMEOUT = 500; //set hold delay 500ms
```

####longtap
A `longtap` gesture happens when the user touches down with one finger and holds it during 300ms or more without moving. The event is fired upon lifting the finger.

```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.longtap, function (event) {
// some code
});
```

####doubletap
A `doubletap` gesture happens when the user quickly taps the screen twice with one finger, after the finger is lifted for the second time.

```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.doubletap, function (event) {
// some code
});
```

#####Double Guard
The `doubletap` event has two modes: enable/disable double guard.
**By default double guard is disabled.**
In this case, if you are subscribed to the `tap` and `double tap` events, when the user taps the screen twice, `GestureTracker` will broadcast both events (`Tap` event for the first tap, `Double Tap` for the second tap).

You should call the `setDoubleGuardState` method with parameter `true` to enable double guard.

```javascript
gesture.setDoubleGuardState(true);
```

In this case, the tap event will be broadcast with a delay (by default the delay equals 300ms). You can change this value, and you should use the DOUBLE_TAP_TIMEOUT field for this purpose.

```javascript
gesture.DOUBLE_TAP_TIMEOUT = 500;//set double tap delay 500ms
```

If you set parameter `true` for the `setDoubleGuardState` method, the gesture tracker will broadcast **only** the `doubletap` event (without the `tap` event) if the user makes a gesture, or the `tap` event if the user makes one tap.
####fling
A `fling` gesture happens when the user touches down with one finger and moves it. The event is fired upon lifting the finger.

```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.fling, function (event) {
// some code
});
```

The object event has fields specific for the `fling` gesture: `speedX` and `speedX`; they show the speed of the moving finger in pixel/ms.

####pan
A `pan` gesture happens when the user touches the screen with a finger and keeps contact while moving the finger around.
```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.pan, function (event) {
   switch (event.action) {
      case 'panstart':
      //
      break;
      case  'panmove':
      //
      break;
      case  'panend':
      //
      break;
      case  'panleft':
      //
      break;
      case  'panright':
      //
      break;
      case  'panup':
      //
      break;
      case  'pandown':
      //
      break;
    }
});
```
####pinch
A `pinch` gesture happens when the user makes a pinching (or reverse) motion with a thumb and a forefinger while touching the screen.
```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.pinch, function (event) {
   switch (event.action) {
      case 'pinchstart':
      //
      break;
      case  'pinchmove':
      //
      break;
      case  'pinchend':
      //
      break;
      case  'pinchin':
      //
      break;
      case  'pinchout':
      //
      break;
    }
});
```
####rotate
A `rotate` gesture happens when the user uses two fingers to rotate the screen while touching it (clockwise or counter-clockwise).
```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.rotate, function (event) {
   switch (event.action) {
      case  'rotatestart':
      //
      break;
      case  'rotatemove':
      //
      break;
      case  'rotateend':
      //
      break;
    }
});
```

####curve
A `curve` gesture fires when you make the same(or almost the same) curve as any previously recorded curve.
To save curves use [Gesture-Recorder](https://github.com/Rapid-Application-Development-JS/Gesture-Recorder) functions `startRecord`, `addNewPoint`, `stopRecord`.
After you saved gestures into [Gesture-Recorder](https://github.com/Rapid-Application-Development-JS/Gesture-Recorder) object you can listen for `curve` to fire:

```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.curve, function (data) {
    alert('Gesture found! Title: ' + data.action + ", probability: " + data.probability);
});
```

[Gesture-Recorder Example](http://rapid-application-development-js.github.io/Gesture-Recorder/example/)

