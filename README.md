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

Now this events have native support only in IE 11 and newer versions.
You have to use mouse event wrapper that provides needed events for working with others browsers. We recommend use our wrapper
[Pointer](https://github.com/Rapid-Application-Development-JS/Pointer)
