(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return (root.GestureTracker = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = (root.GestureTracker = factory());
  } else {
    root.GestureTracker = factory();
  }
}(this, function () {
  function GestureTracker(element) {


    /////////////////////////////////////////
    /////////////////////////////////////////
  /////////////////////////////////////////

    var attribute, doubleGuardState = false, tracker = this;

    this.PanDirection ={
      horizontal: 'horizontal',
      vertical: 'vertical',
      all: 'all',
      directionType: {
        left: 'left',
        right: 'right',
        up: 'up',
        down: 'down'
      }
    };

    this.PinchOptions = {
      isPinchStartFired: false,
      startDistance: undefined,
      points : [],
      threshold: 10
    },

    this.PanOptions = {
      isPanStartFired: false,
      threshold: 10,
      direction: tracker.PanDirection.all,
      pointers: 1,
      isAllowHorizontalDirectional: function () {
        return this.direction === tracker.PanDirection.all || this.direction === tracker.PanDirection.horizontal;
      },
      isAllowVerticalDirectional: function () {
        return this.direction === tracker.PanDirection.all || this.direction === tracker.PanDirection.vertical;
      },
      getDirection: function (xSpin, ySpin) {
        if (Math.abs(xSpin) > Math.abs(ySpin)) {
          if (this.isAllowHorizontalDirectional()) {
            if (xSpin > 0) {
              return tracker.PanDirection.directionType.left;
            } else {
              return tracker.PanDirection.directionType.right;
            }
          } else {
            return undefined;
          }
        } else {
          if (this.isAllowVerticalDirectional()) {
            if (ySpin > 0) {
              return tracker.PanDirection.directionType.up;
            } else {
              return tracker.PanDirection.directionType.down;
            }
          } else {
            return undefined;
          }
        }
      }
    };

    this._el = element;
    this.version = "1.0.0";
    this.MOVE_LIMIT = 10;
    /**
     * @returns {Number}
     * @private
     */
    function _getDevicePixelRatio() {
      return ('devicePixelRatio' in window) ? window['devicePixelRatio'] : 1;
    }

    function getAddListener(element) {
      return element.addEventListener || element.attachEvent;
    }

    function getRemoveEventListener(element) {
      return element.removeEventListener || element.detachEvent;
    }

    function onReady(callback) {
      var addListener = getAddListener(document),
        removeListener = getRemoveEventListener(document),
        eventName = document.addEventListener ? 'DOMContentLoaded' : 'onreadystatechange';
      addListener.call(document, eventName, function () {
        removeListener.call(document, eventName, arguments.callee, false);
        callback();
      }, false)
    }

    for (field in this.TRACK_EVENTS) {
      //noinspection JSUnfilteredForInLoop
      this._el.addEventListener(this.TRACK_EVENTS[field], this, false);
      getAddListener(this._el).call(this._el, this.TRACK_EVENTS[field], this, false);
    }
    this.setDoubleGuardState = function (key) {
      doubleGuardState = key;
    };
    this.getDoubleGuardState = function () {
      return doubleGuardState;
    };
    this.destroy = function () {
      for (field in this.TRACK_EVENTS) {
        if (this.TRACK_EVENTS.hasOwnProperty(field)) {
          getRemoveEventListener(this._el).call(this._el, this.TRACK_EVENTS[field], this);
        }
      }
      this._el = null;
    };
    onReady(function () {
      var element = document.createElement('div'), ppi, dpi;
      element.style.position = 'absolute';
      element.style.height = '1in';
      element.style.width = '1in';
      element.style.top = '-100%';
      element.style.left = '-100%';
      document.body.appendChild(element);
      ppi = element.offsetHeight;
      document.body.removeChild(element);
      dpi = ppi * _getDevicePixelRatio() * screen.pixelDepth / 24;
      tracker.MOVE_LIMIT = dpi / 6;
    });

    this._calculationStartAverageDistance = function() {
      var count = 0, sum = 0;
      for (var i = 0; i !== this.tracks.length; i++) {
        for (var j = this.tracks.length-i+1; j !== this.tracks.length; j++) {
          if (i !== j) {
            this.PinchOptions.points[i]=i;
            sum += calculateDistance({
                x: this.tracks[i].start.clientX,
                y: this.tracks[i].start.clientY
              },
              {
                x: this.tracks[j].start.clientX,
                y: this.tracks[j].start.clientY
              });
            count++;
          }
        }
      }
      return sum/count;
    };

    this._calculationCurrentAverageDistance = function() {
      var count = 0, sum = 0;
      for (var i = 0; i !== this.tracks.length; i++) {
        for (var j = i+1; j !== this.tracks.length; j++) {
          if (i !== j) {
            this.PinchOptions.points[i]=i;
            sum += calculateDistance({
                x: this.tracks[i].last.clientX,
                y: this.tracks[i].last.clientY
              },
              {
                x: this.tracks[j].last.clientX,
                y: this.tracks[j].last.clientY
              });
            count++;
          }
        }
      }
      return sum/count;
    };

    function calculateDistance(point1, point2) {
      return Math.pow((Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)), 0.5);
    };

  }

  GestureTracker.prototype = {
    DOUBLE_TAP_TIMEOUT: 300,
    HOLD_TIMEOUT: 350,
    GESTURE_EVENTS: {
      hold: 'hold',
      fling: 'fling',
      longtap: 'longtap',
      tap: 'tap',
      doubletap: 'doubletap',
      pan: 'pan',
      pinch: 'pinch'
    },

    GESTURE_ACTIONS: {
      panstart: 'panstart',
      panmove: 'panmove',
      panend: 'panend',
      panleft: 'panleft',
      panright: 'panright',
      panup: 'panup',
      pandown: 'pandown',

      pinchstart: 'pinchstart',
      pinchmove: 'pinchmove',
      pinchend: 'pinchend',
      pinchin: 'pinchin',
      pinchout: 'pinchout'
    },

    TRACK_EVENTS: {
      up: 'pointerup',
      down: 'pointerdown',
      move: 'pointermove',
      over: 'pointerover',
      cancel: 'pointercancel'
    },
    tracks: {},
    firstDownTime: 0,
    handleEvent: function (event) {
      switch (event.type) {
        case this.TRACK_EVENTS.down:
          this._pointerDown(event);
          break;
        case this.TRACK_EVENTS.move:
          this._pointerMove(event);
          break;
        case this.TRACK_EVENTS.cancel:
        case this.TRACK_EVENTS.up:
          this._pointerUp(event);
          break;
      }
    },
    _pointerDown: function (event) {
      this.touchID = event.pointerId;
      var gesture = this;
      clearTimeout(this._holdID);
      this._holdID = setTimeout(function () {
        gesture._fireEvent(this.GESTURE_EVENTS.hold, event);
      }.bind(this), this.HOLD_TIMEOUT);
      this.tracks[event.pointerId] = {
        start: {
          clientX: event.clientX,
          clientY: event.clientY,
          timeStamp: event.timeStamp
        },
        pre: {
          clientX: event.clientX,
          clientY: event.clientY,
          timeStamp: event.timeStamp
        },
        last: {
          clientX: event.clientX,
          clientY: event.clientY,
          timeStamp: event.timeStamp
        },
        end: {
          clientX: event.clientX,
          clientY: event.clientY,
          timeStamp: event.timeStamp
        }
      };
    },

    _pointerMove: function (event) {
      var isMovedByX, isMovedByY, xSpin, ySpin;
      if (this.tracks && this.tracks[event.pointerId]) {
        if (event.timeStamp - this.tracks[event.pointerId].last.timeStamp > 10) {
          isMovedByX = Math.abs(this.tracks[event.pointerId].last.clientX - this.tracks[event.pointerId].pre.clientX) > this.MOVE_LIMIT;
          isMovedByY = Math.abs(this.tracks[event.pointerId].last.clientY - this.tracks[event.pointerId].pre.clientY) > this.MOVE_LIMIT;
          if (isMovedByX || isMovedByY) {
            clearTimeout(this._holdID);
          }
          this.tracks[event.pointerId].pre.clientX = this.tracks[event.pointerId].last.clientX;
          this.tracks[event.pointerId].pre.clientY = this.tracks[event.pointerId].last.clientY;
          this.tracks[event.pointerId].pre.timeStamp = this.tracks[event.pointerId].last.timeStamp;
          this.tracks[event.pointerId].last.clientX = event.clientX;
          this.tracks[event.pointerId].last.clientY = event.clientY;
          this.tracks[event.pointerId].last.timeStamp = event.timeStamp;
        }

        xSpin = this.tracks[event.pointerId].start.clientX - event.clientX;
        ySpin = this.tracks[event.pointerId].start.clientY - event.clientY;
        var eventOptions = {}, direction = this.PanOptions.getDirection(xSpin, ySpin);
        if (!this.PanOptions.isPanStartFired) {
          isMovedByX = Math.abs(xSpin) > this.PanOptions.threshold && direction;
          isMovedByY = Math.abs(ySpin) > this.PanOptions.threshold && direction;
          if (isMovedByX || isMovedByY) {
            eventOptions.action = this.GESTURE_ACTIONS.panstart;
            eventOptions.direction = direction;
            eventOptions.distansX = xSpin;
            eventOptions.distansY = ySpin;
            this._fireEvent(this.GESTURE_EVENTS.pan, event, eventOptions);
            this.PanOptions.isPanStartFired = true;
            this.tracks[event.pointerId].start.direction = direction;

            eventOptions.action = this.GESTURE_EVENTS.pan + direction;
            this._fireEvent(this.GESTURE_EVENTS.pan, event, eventOptions);
            this.tracks[event.pointerId].start.direction = direction;
          }
        } else if (direction) {
          eventOptions.action = this.GESTURE_ACTIONS.panmove;
          eventOptions.direction = direction;
          eventOptions.distansX = xSpin;
          eventOptions.distansY = ySpin;
          this._fireEvent(this.GESTURE_EVENTS.pan, event, eventOptions);

          if (this.tracks[event.pointerId].start.direction !== direction) {
            eventOptions.action = this.GESTURE_EVENTS.pan + direction;
            this._fireEvent(this.GESTURE_EVENTS.pan, event, eventOptions);
            this.tracks[event.pointerId].start.direction = direction;
          }
        }

        if (Object.keys(this.tracks).length > 1) {
          var currentDistance = this._calculationCurrentAverageDistance(),
          startDistance = this.PinchOptions.startDistance||this._calculationStartAverageDistance(),
          zoomSpin = startDistance-currentDistance;
          if (!this.PinchOptions.isPinchStartFired) {
            if(Math.abs(zoomSpin)>startDistance*0.05){
              eventOptions.action = this.GESTURE_ACTIONS.pinchstart;
              eventOptions.zoom = Math.abs(currentDistance/startDistance);
              eventOptions.pinchSize = currentDistance;
              eventOptions.distansY = ySpin;
              eventOptions.pointsCount = this.tracks.length;
              this._fireEvent(this.GESTURE_EVENTS.pan, event, eventOptions);
            }
          }
        }
      }
    },



      _pointerUp: function (event) {
        var xSpin, ySpin, eventOptions = {};
        clearTimeout(this._holdID);
        if (!this.tracks || !this.tracks[event.pointerId]) {
          return;
        }
        this.tracks[event.pointerId].end.clientX = event.clientX;
        this.tracks[event.pointerId].end.clientY = event.clientY;
        this.tracks[event.pointerId].end.timeStamp = event.timeStamp;
        this._checkGesture(event);
        if (this.PanOptions.isPanStartFired) {
          xSpin = this.tracks[event.pointerId].start.clientX - event.clientX;
          ySpin = this.tracks[event.pointerId].start.clientY - event.clientY;
          eventOptions.action = this.GESTURE_ACTIONS.panend;
          eventOptions.direction = this.PanOptions.getDirection(xSpin, ySpin);
          eventOptions.distansX = xSpin;
          eventOptions.distansY = ySpin;
          this._fireEvent(this.GESTURE_EVENTS.pan, event, eventOptions);
          this.PanOptions.isPanStartFired = false;
        }
        this.tracks[event.pointerId] = null;
      },

      _checkGesture: function (event) {
        var isMoved, isFling, eventPointerId = event.pointerId, trackPointerId = this.tracks[eventPointerId];

        function distance(x1, x2, y1, y2) {
          return Math.pow(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), 0.5);
        }

        isMoved = Math.abs(distance(trackPointerId.start.clientX, trackPointerId.end.clientX, trackPointerId.start.clientY, trackPointerId.end.clientY)) > 20;
        isFling = Math.abs(distance(trackPointerId.end.clientX, trackPointerId.pre.clientX, trackPointerId.end.clientY, trackPointerId.pre.clientY)) > 0 && trackPointerId.end.timeStamp - trackPointerId.start.timeStamp > 50;
        if (isFling) {
          this._fireEvent(this.GESTURE_EVENTS.fling, event, {
            start: trackPointerId.start,
            end: trackPointerId.end,
            speedX: (trackPointerId.end.clientX - trackPointerId.pre.clientX) / (trackPointerId.end.timeStamp - trackPointerId.pre.timeStamp),
            speedY: (trackPointerId.end.clientY - trackPointerId.pre.clientY) / (trackPointerId.end.timeStamp - trackPointerId.pre.timeStamp)
          });
        } else if (!isMoved) {
          if (trackPointerId.end.timeStamp - trackPointerId.start.timeStamp > 300) {
            this._fireEvent(this.GESTURE_EVENTS.longtap, event);
          } else if (event.timeStamp - this.firstDownTime < this.DOUBLE_TAP_TIMEOUT) {
            if (this.getDoubleGuardState()) {
              clearTimeout(this._deferredId);
            }
            this._fireDeferredEvent(this.GESTURE_EVENTS.doubletap, event);
          } else {
            this.firstDownTime = event.timeStamp;
            if (this.getDoubleGuardState()) {
              this._deferredId = setTimeout(function () {
                this._fireDeferredEvent(this.GESTURE_EVENTS.tap, event);
                clearTimeout(this._deferredId);
              }.bind(this), this.DOUBLE_TAP_TIMEOUT);
            } else {
              this._fireEvent(this.GESTURE_EVENTS.tap, event);
            }
          }
        }
      },

      _fireDeferredEvent: function (type, event) {
        this._fireEvent(type, event);
        this.firstDownTime = 0;
      },

      _fireEvent: function (type, event, addiction) {
        var attr, customEvent = document.createEvent('MouseEvents');
        customEvent.initMouseEvent(type, true, true, window, 1, event.screenX, event.screenY,
          event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button,
          event.relatedTarget);
        // event attributes
        customEvent.pointerId = this.touchID;
        customEvent.pointerType = event.pointerType;
        if (addiction) {
          for (attr in addiction) {
            if (addiction.hasOwnProperty(attr)) {
              customEvent[attr] = addiction[attr];
            }
          }
        }
        event.target.dispatchEvent(customEvent);
      }
    };
  return GestureTracker;
}));
