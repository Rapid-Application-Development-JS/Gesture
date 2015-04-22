# Gesture
Gesture events are built on top of the W3C Pointer Events model. Use gesture events to help recognize and respond to more complex touch-based user interactions without having to capture and interpret individual pointer events yourself

**Note** Gesture works only with one touch. Multitouch mode does not supported yet. If user makes multitouch gesture - first point will be processed, others will be skipped.

Now module provides next tap-events: 
- tap
- longtap
- doubletap
- hold
- fling

**Warning:** Your widgets should broadcast next events for correct work of module `Gesture`:
- pointerup
- pointerdown
- pointermove
- pointerover
- pointercancel

Now these events have native support only in IE 11 and newer versions.
You have to use mouse event wrapper that provides needed events for working with others browsers. We recommend to use our wrapper
[Pointer](https://github.com/Rapid-Application-Development-JS/Pointer)

###Gesture events and the GestureTracker object
The first step for handling gestures in your code give the gesture a target element. This is the element to which the module will fire gesture events. It’s also the element that determines the coordinate space for the events.
```javascript
var $div = document.querySelector('#pointer');
```
Next you should instantiate a gesture with target element.
```javascript
var gesture = new GestureTracker($div);
```
Finally, subscribe element on gesture event
```javascript
$div.addEventListener("tap", function (event) {
// some code
});
```
`GesterTraker` has object `GESTURE_EVENTS` that contains string fields with names of gesture events. You can use it for subscribe event
```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.tap, function (event) {
// some code
});
```
###Gestures
####tap
The most basic gesture recognition is a tap. When a tap is detected, the `GesterTraker` event is fired at the target element of the gesture object. Different from the click event, the tap gesture only fires when a user touches (or presses a mouse button, or touches a pen) down and up without moving. This is useful if you want to differentiate between a user tapping on an element versus dragging the element.
####hold
A hold gesture happens when a user touches down with one finger and holds during 350ms without moving.
```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.hold, function (event) {
// some code
});
```
You can change hold delay, for this use field `HOLD_TIMEOUT`
```javascript
gesture.HOLD_TIMEOUT = 500; //set hold delay 500ms
```
####doubletap
A `doubletap` gesture happens when a user fast twice touches screen one finger after he ups finger second time.
```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.doubletap, function (event) {
// some code
});
```
#####Double Guard
`doubletap` event has two modes: enable/disable double guard.
**As default double guard is disabled.**
In this case, if you are subscribed to `tap` and `double tap` events, when user twice touches screen `GestureTracker` will broadcast both events (`Tap` event for first tap, `Double Tap` for second tap).

You should call method `setDoubleGuardState` with parameter `true` for enabled double guard
```javascript
gesture.setDoubleGuardState(true);
```
In this case, tap event will be broadcasted with a delay (as a default delay = 300ms). You can change this value, you should use DOUBLE_TAP_TIMEOUT field for this purpose.
```javascript
gesture.DOUBLE_TAP_TIMEOUT = 500;//set double tap delay 500ms
```
If you set parameter `true` for `setDoubleGuardState` method - gesture tracker will broadcast **only** `doubletap` event (without `tap` event) if user makes it gesture, or `tap` event if user makes one touch.
