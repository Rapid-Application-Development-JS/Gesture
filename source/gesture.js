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
  function GestureTracker(element, onReadyCallBack) {

    function EventTracks() {
      var scope = this,
        _tracks = {},
        _eventCount = 0;

      scope.getCount = function () {
        return _eventCount;
      };

      scope.hasEvent = function (pointerId) {
        return _tracks[pointerId] ? true : false;
      };

      scope.setNewEvent = function (event) {
        if (!scope.hasEvent(event.pointerId)) {
          _eventCount++;
        }
        _tracks[event.pointerId] = _createEvent(event);
      };

      scope.getTrack = function (pointerId) {
        return _tracks[pointerId];
      };

      scope.removeEvent = function (pointerId) {
        if (scope.hasEvent(pointerId)) {
          _eventCount--;
        }
        _tracks[pointerId] = null;
      };

      scope.calculateDistance = function (x1, x2, y1, y2) {
        return Math.pow(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), 0.5);
      };

      scope.updateEvent = function (event) {
        _tracks[event.pointerId].pre.clientX = _tracks[event.pointerId].last.clientX;
        _tracks[event.pointerId].pre.clientY = _tracks[event.pointerId].last.clientY;
        _tracks[event.pointerId].pre.timeStamp = _tracks[event.pointerId].last.timeStamp;
        _tracks[event.pointerId].last.clientX = event.clientX;
        _tracks[event.pointerId].last.clientY = event.clientY;
        _tracks[event.pointerId].last.timeStamp = event.timeStamp;
      };

      scope.setEndEvent = function (event) {
        _tracks[event.pointerId].end.clientX = event.clientX;
        _tracks[event.pointerId].end.clientY = event.clientY;
        _tracks[event.pointerId].end.timeStamp = event.timeStamp;
      };

      ////////////////////////////////
      function _createEvent(event) {
        return {
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
      }
    }

    function GestureTap(tracks, fireEvent, params) {
      var _gesture = this,
        _options = {},
        _params = mix({
          tapDuration: 300,
          tapDelay: 300,
          doubleGuardState: true
        }, params),
        _isrecognized,
        _type = _scope.GESTURE_EVENTS.tap,
        _delayTapId,
        _priveosTapTimeStamp,
        _tracks = tracks;


      _gesture.pointerDown = function (event) {
        _isrecognized = true;
      };

      _gesture.pointerMove = function (event) {
        _isrecognized = false;
      };

      _gesture.getDoubleGuardState = function() {
        return _params.doubleGuardState;
      },
        _gesture.setDoubleGuardState = function(value) {
        _params.doubleGuardState = value;
      }

      _gesture.pointerUp = function (event) {
        var track = _tracks.getTrack(event.pointerId);
        if (_isrecognized) {
          if ((track.end.timeStamp - track.start.timeStamp) < _params.tapDuration) {
            if ((!_priveosTapTimeStamp) || (track.end.timeStamp - _priveosTapTimeStamp > _params.tapDelay)) {
              _priveosTapTimeStamp = track.end.timeStamp;
              if (_params.doubleGuardState) {
                _delayTapId = setTimeout(function () {
                  fireEvent(_type, event, _options);
                  _delayTapId = null;
                }.bind(_gesture), _params.tapDelay);
              } else {
                fireEvent(_type, event, _options);
              }
            } else {
              if (_params.doubleGuardState) {
                clearTimeout(_delayTapId);
                _delayTapId = null;
              }
              fireEvent(_scope.GESTURE_EVENTS.doubletap, event, _options);
            }
          } else {
            fireEvent(_scope.GESTURE_EVENTS.longtap, event, _options);
          }
        }
        _isrecognized = false;
      };
    }

    function GestureHold(tracks, fireEvent) {
      var _gesture = this,
        _holdTimeout = 500,
        _type = _scope.GESTURE_EVENTS.hold,
        _options = {},
        _holdID,
        _tracks = tracks;

      _gesture.pointerDown = function (event) {
        clearTimeout(_holdTimeout);
        _holdID = setTimeout(function () {
          fireEvent(_type, event, _options);
          _holdID = null;
        }.bind(_gesture), _holdTimeout);
      };

      _gesture.pointerMove = function (event) {
        clearTimeout(_holdID);
        _holdID = null;
      };

      _gesture.pointerUp = function (event) {
        clearTimeout(_holdID);
        _holdID = null;
      };
    }

    function GestureFling(tracks, fireEvent) {
      var _gesture = this,
        _type = _scope.GESTURE_EVENTS.fling,
        _options = {},
        _tymeDelay = 50;
      _tracks = tracks;


      _gesture.pointerDown = function (event) {

      };

      _gesture.pointerMove = function (event) {

      };

      _gesture.pointerUp = function (event) {
        var track = _tracks.getTrack(event.pointerId),
          distance = _tracks.calculateDistance(track.end.clientX, track.pre.clientX, track.end.clientY, track.pre.clientY),
          isFling = Math.abs(distance) > 0 && track.end.timeStamp - track.start.timeStamp > _tymeDelay;
        if (isFling) {
          _options.start = track.start;
          _options.end = track.end;
          _options.duration = track.end.timeStamp - track.start.timeStamp;
          _options.speedX = (track.end.clientX - track.pre.clientX) / (_options.duration);
          _options.speedY = (track.end.clientY - track.pre.clientY) / (_options.duration);
          _options.speed = distance / _options.duration;
          fireEvent(_type, event, _options);
        }
      };
    }

    function GestureRotate(tracks, fireEvent) {
      var _gesture = this,
        _type = _scope.GESTURE_EVENTS.rotate,
        _options = {angle: 0},
        _preCenterPoint,
        _tracks = tracks,
        RotateActions = {
          rotatestart: 'rotatestart',
          rotatemove: 'rotatemove',
          rotateend: 'rotateend'
        };

      function calculateCenterPoint() {
        var count = 0,
          maxX = _tracks.getTrack(0).last.clientX,
          maxY = _tracks.getTrack(0).last.clientY,
          minX = maxX,
          minY = maxY,
          point,
          centerPoint;
        for (var i = 1; i !== _tracks.getCount(); i++) {
          point = _tracks.getTrack(i).last;
          if (maxX < point.clientX) {
            maxX = point.clientX;
          }
          if (minX > point.clientX) {
            minX = point.clientX;
          }
          if (maxY < point.clientY) {
            maxY = point.clientY;
          }
          if (minY > point.clientY) {
            minY = point.clientY;
          }
        }
        centerPoint = {
          x: minX + (maxX - minX) / 2,
          y: minY + (maxY - minY) / 2
        };
        return centerPoint;
      };

      _gesture.pointerDown = function (event) {
        //if(_tracks.getCount()>1) {
        //  preCenterPoint = calculateCenterPoint();
        //}
      };

      _gesture.pointerMove = function (event) {
        if (_tracks.getCount() > 1) {
          var centerPointer = calculateCenterPoint(),
            track,
            sumAngle = 0,
            currentAngle;
          _options.center = centerPointer;
          if (!_preCenterPoint) {
            _options.action = RotateActions.rotatestart;
            for (var i = 0; i !== _tracks.getCount(); i++) {
              track = _tracks.getTrack(i);
              currentAngle = (Math.atan2(centerPointer.y - track.last.clientY, centerPointer.x - track.last.clientX) / Math.PI * 180);
              currentAngle = (currentAngle < 0) ? currentAngle + 360 : currentAngle;
              track.pre.angle = currentAngle;
            }
            fireEvent(_type, event, _options);
          } else {
            for (var i = 0; i !== _tracks.getCount(); i++) {
              track = _tracks.getTrack(i);
              currentAngle = (Math.atan2(centerPointer.y - track.last.clientY, centerPointer.x - track.last.clientX) / Math.PI * 180);
              currentAngle = (currentAngle < 0) ? currentAngle + 360 : currentAngle;
              sumAngle += currentAngle - track.pre.angle;
              track.pre.angle = currentAngle;
            }
            sumAngle = sumAngle / _tracks.getCount();
            _options.action = RotateActions.rotatemove;
            _options.angleSpin = sumAngle;
            _options.angle += sumAngle;
            fireEvent(_type, event, _options);
          }
          _preCenterPoint = centerPointer;
        }
      };

      _gesture.pointerUp = function (event) {
        var track = _tracks.getTrack(event.pointerId);
        if (_tracks.getCount() < 2) {
          _options.angle = 0;
          _preCenterPoint = null;
        }
      };
    }

    function GesturePinch(tracks, fireEvent, params) {
      var _gesture = this,
        _type = _scope.GESTURE_EVENTS.pinch,
        _startDistance,
        _isPinchStartFired = false,
        _direction,
        _options = {},
        _distance = {
          sumStart: null,
          sumLast: null,
          sumPre: null
        },
        _tracks = tracks,
        PinchActions = {
          pinchstart: 'pinchstart',
          pinchmove: 'pinchmove',
          pinchend: 'pinchend',
          pinchin: 'pinchin',
          pinchout: 'pinchout'
        },
        Directions = {
          in: 'in',
          out: 'out'
        },
        _params = mix({
          threshold: MOVE_LIMIT
        }, params);

      function calculateAverageDistance() {
        var count = 0, sumStart = 0, sumLast = 0, sumPre = 0;
        if (_distance.sumLast) {
          _distance.sumPre = _distance.sumLast;
        }
        for (var i = 0; i !== _tracks.getCount(); i++) {
          for (var j = i + 1; j !== _tracks.getCount(); j++) {
            if (i !== j) {
              if (!_distance.sumStart) {
                sumStart += _tracks.calculateDistance(
                  _tracks.getTrack(i).start.clientX,
                  _tracks.getTrack(j).start.clientX,
                  _tracks.getTrack(i).start.clientY,
                  _tracks.getTrack(j).start.clientY);
              }
              sumLast += _tracks.calculateDistance(
                _tracks.getTrack(i).last.clientX,
                _tracks.getTrack(j).last.clientX,
                _tracks.getTrack(i).last.clientY,
                _tracks.getTrack(j).last.clientY);
              count++;
            }
          }
        }
        _distance.sumLast = sumLast / count;
        _distance.sumPre = _distance.sumPre || _distance.sumLast;
        _distance.sumStart = _distance.sumStart || sumStart / count;
      }

      _gesture.pointerDown = function (event) {

      };

      _gesture.pointerMove = function (event) {
        if (_tracks.getCount() > 1) {
          calculateAverageDistance();
          var zoomSpin = _distance.sumStart - _distance.sumLast,
            currentDirection;

          _options.zoom = Math.abs(_distance.sumLast / _distance.sumStart);
          _options.pinchSize = _distance.sumLast;
          _options.pointsCount = _tracks.getCount();
          if (!_isPinchStartFired) {
            if (Math.abs(zoomSpin) > _distance.sumStart * 0.05) {
              _options.action = PinchActions.pinchstart;
              fireEvent(_type, event, _options);
            }
            _isPinchStartFired = true;
          }
          currentDirection = _options.zoom > 1 ? Directions.out : Directions.in;
          _options.action = PinchActions.pinchmove;
          fireEvent(_type, event, _options);
          if (_direction || _direction !== currentDirection) {
            _options.action = _type + currentDirection;
            _direction = currentDirection;
            fireEvent(_type, event, _options);
          }

        }
      };

      _gesture.pointerUp = function (event) {
        if (_isPinchStartFired) {
          _options.action = PinchActions.pinchend;
          _options.pointsCount = _tracks.getCount();
          fireEvent(_type, event, _options);
          _isPinchStartFired = false;
        }
      };
    }

    function GesturePan(tracks, fireEvent, params) {
      var _gesture = this,
        _options = {},
        _isPanStartFired = false,
        _tracks = tracks,
        _type = _scope.GESTURE_EVENTS.pan,
        _currentDirection,
        _allowHorizontalDirection,
        _allowVerticalDirectional,
        PanDirection = {
          horizontal: 'horizontal',
          vertical: 'vertical',
          all: 'all',
          DirectionType: {
            left: 'left',
            right: 'right',
            up: 'up',
            down: 'down'
          }
        },
        _params = mix({
          direction: PanDirection.all,
          threshold: MOVE_LIMIT
        }, params),
        PanActions = {
          panstart: 'panstart',
          panmove: 'panmove',
          panend: 'panend',
          panleft: 'panleft',
          panright: 'panright',
          panup: 'panup',
          pandown: 'pandown'
        };

      init();

      function init() {
        _allowHorizontalDirection = _params.direction === PanDirection.all || _params.direction === PanDirection.horizontal;
        _allowVerticalDirectional = _params.direction === PanDirection.all || _params.direction === PanDirection.vertical;
      }

      function getDirection(xSpin, ySpin) {
        var result = undefined;
        if (Math.abs(xSpin) > Math.abs(ySpin)) {
          if (_allowHorizontalDirection) {
            if (xSpin > 0) {
              result = PanDirection.DirectionType.right;
            } else {
              result = PanDirection.DirectionType.left;
            }
          }
        } else {
          if (_allowVerticalDirectional) {
            if (ySpin > 0) {
              result = PanDirection.DirectionType.down;
            } else {
              result = PanDirection.DirectionType.up;
            }
          }
        }
        return result;
      }

      _gesture.pointerDown = function (event) {

      };

      _gesture.pointerMove = function (event) {
        var track = _tracks.getTrack(event.pointerId),
          xSpin = event.clientX - track.start.clientX,
          ySpin = event.clientY - track.start.clientY,
          direction = getDirection(xSpin, ySpin),
          isMovedByX,
          isMovedByY;

        if (!_isPanStartFired && direction) {
          isMovedByX = Math.abs(xSpin) > _params.threshold && direction;
          isMovedByY = Math.abs(ySpin) > _params.threshold && direction;
          if (isMovedByX || isMovedByY) {
            _options.action = PanActions.panstart;
            _options.direction = direction;
            _options.distanceX = xSpin;
            _options.distanceY = ySpin;
            fireEvent(_type, event, _options);

            _isPanStartFired = true;
            _currentDirection = direction;
            _options.action = _type + direction;
            fireEvent(_type, event, _options);
          }
        } else if (direction) {
          _options.action = PanActions.panmove;
          _options.direction = direction;
          _options.distanceX = xSpin;
          _options.distanceY = ySpin;
          fireEvent(_type, event, _options);

          if (_currentDirection !== direction) {
            _options.action = _type + direction;
            fireEvent(_type, event, _options);
            track.start.direction = direction;
          }
        }
      };

      _gesture.pointerUp = function (event) {
        if (_isPanStartFired) {
          var xSpin = event.clientX - _tracks.getTrack(event.pointerId).start.clientX,
            ySpin = event.clientY - _tracks.getTrack(event.pointerId).start.clientY;
          _options.action = PanActions.panend;
          _options.direction = getDirection(xSpin, ySpin);
          _options.distanceX = xSpin;
          _options.distanceY = ySpin;
          fireEvent(_type, event, _options);
          _isPanStartFired = false;
        }
      };
    }

    //-----Constants-----//
    var MOVE_LIMIT,
      TRACK_EVENTS = {
        up: 'pointerup',
        down: 'pointerdown',
        move: 'pointermove',
        over: 'pointerover',
        cancel: 'pointercancel'
      };

    //-----Private variables-----//
    var _element = element,
      _scope = this,
      _gestures = [],
      _onReadyCallBack = onReadyCallBack,
      _handleEvent = function (event) {
        switch (event.type) {
          case TRACK_EVENTS.down:
            _pointerDown(event);
            break;
          case TRACK_EVENTS.move:
            _pointerMove(event);
            break;
          case TRACK_EVENTS.cancel:
          case TRACK_EVENTS.up:
            _pointerUp(event);
            break;
        }
      }.bind(_scope),
      _tracks = new EventTracks(),
      _currentTouchID;


    //-----Public variables-----//
    _scope.version = "1.1.0";
    _scope.GESTURE_EVENTS = {
      hold: 'hold',
      fling: 'fling',
      longtap: 'longtap',
      tap: 'tap',
      doubletap: 'doubletap',
      pan: 'pan',
      pinch: 'pinch',
      rotate: 'rotate'
    };
    init();

    //----------------------------------------

    function mix(obj, mixin) {
      var attr;
      for (attr in mixin) {
        if (mixin.hasOwnProperty(attr)) {
          obj[attr] = mixin[attr];
        }
      }
      return obj;
    }

    function _fireEvent(type, event, addiction) {
      var attr, customEvent = document.createEvent('MouseEvents');
      customEvent.initMouseEvent(type, true, true, window, 1, event.screenX, event.screenY,
        event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button,
        event.relatedTarget);
      // event attributes
      customEvent.pointerId = _currentTouchID;
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

//------------------Init----------------

    function init() {
      _tracks = new EventTracks();
      for (var field in TRACK_EVENTS) {
        //_element.addEventListener(this.TRACK_EVENTS[field], __handleEvent, false);
        getAddListener(_element).call(_element, TRACK_EVENTS[field], _handleEvent, false);
      }

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
        MOVE_LIMIT = dpi / 6;

        MOVE_LIMIT = 20;
        _gestures.push(
          new GestureTap(_tracks, _fireEvent),
          new GestureHold(_tracks, _fireEvent),
          new GesturePan(_tracks, _fireEvent),
          new GestureFling(_tracks, _fireEvent),
          new GesturePinch(_tracks, _fireEvent),
          new GestureRotate(_tracks, _fireEvent)
        );
        if(_onReadyCallBack){
          _onReadyCallBack();
        }
      });
    }

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
      }, false);
    }

    //--------------------Event methods--------------------
    function _pointerDown(event) {
      _currentTouchID = event.pointerId;
      _tracks.setNewEvent(event);
      for (var i = 0; i != _gestures.length; i++) {
        _gestures[i].pointerDown(event, _tracks);
      }
    }

    function _pointerMove(event) {
      var isMovedByX, isMovedByY, track;
      if (_tracks.hasEvent(event.pointerId)) {
        track = _tracks.getTrack(event.pointerId);
        if (event.timeStamp - track.last.timeStamp > 10) {
          isMovedByX = Math.abs(track.last.clientX - track.start.clientX) > MOVE_LIMIT;
          isMovedByY = Math.abs(track.last.clientY - track.start.clientY) > MOVE_LIMIT;
          if (isMovedByX || isMovedByY) {
            for (var i = 0; i != _gestures.length; i++) {
              _gestures[i].pointerMove(event, _tracks);
            }
          }
          _tracks.updateEvent(event, _tracks);
        }
      }
    }

    function _pointerUp(event) {
      if (_tracks.hasEvent(event.pointerId)) {
        _tracks.setEndEvent(event);
        for (var i = 0; i != _gestures.length; i++) {
          _gestures[i].pointerUp(event, _tracks);
        }
        _tracks.removeEvent(event.pointerId);
      }
    }

    //====================================================
    //              Public Methods
    //====================================================

    _scope.destroy = function () {
      for (var field in this.TRACK_EVENTS) {
        if (TRACK_EVENTS.hasOwnProperty(field)) {
          getRemoveEventListener(_element).call(_element, TRACK_EVENTS[field], _handleEvent);
        }
      }
      _element = null;
    };

    _scope.addGesture = function (gesture) {
      _gestures.push(gesture);
    }

    _scope.getDoubleGuardState = function() {
      return _gestures[0].getDoubleGuardState();
    };
    _scope.setDoubleGuardState = function(value) {
      _gestures[0].setDoubleGuardState(value);
    };

  }

  return GestureTracker;
}));

