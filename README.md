# Gesture
Provide tap-events for DOM elements: 
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
###Initialization

You should init `GestureTracker` with DOM element to add gestures to this element.
```javascript
var $div = document.querySelector('#pointer');
var gesture = new GestureTracker($div);
```
###Add event listener
`GesterTraker` has object `GESTURE_EVENTS` that contains string fields with names of gesture events:
```javascript
gesture.GESTURE_EVENTS
```
####Example
```javascript
$div.addEventListener(gesture.GESTURE_EVENTS.tap, function (event) {
// some code
});
```
###Double Guard
`Double tap` event has two modes: enable/disable double guard.
**As default double guard is disabled.**
In this case, if you are subscribed to `tap` and `double tap` events, when user makes `double tap` `GestureTracker` will broadcast both events (`Tap` event for first tap, `Double Tap` for second tap).

You should call method `setDoubleGuardState` with parameter `true` for enabled double guard
```javascript
gesture.setDoubleGuardState(true);
```
In this case, tap event will be broadcasted with a delay (as a default delay = 300ms). You can change this value, you should use DOUBLE_TAP_TIMEOUT field for this purpose.

```javascript
gesture.DOUBLE_TAP_TIMEOUT = 500;
```
If you set parameter `true` for `setDoubleGuardState` method - gesture tracker will broadcast **only** `doubletap` event (without `tap` event) if user makes it gesture, or `tap` event if user makes one touch.
