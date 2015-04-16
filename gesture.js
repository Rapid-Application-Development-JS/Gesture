(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(function () {
            return (root.GestureTracker = factory());
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = (root.GestureTracker = factory());
    } else {
        root.GestureTracker = factory();
    }
}(this, function () {
    function GestureTracker(element) {
        var attribute, doubleGuardState = false, tracker = this;
        this._el = element;
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
                eventName = document.addEventListener ? "DOMContentLoaded" : "onreadystatechange";
            addListener.call(document, eventName, function () {
                removeListener.call(document, eventName, arguments.callee, false);
                callback();
            }, false)
        }


        for (attribute in this.TRACK_EVENTS) {
            //noinspection JSUnfilteredForInLoop
            this._el.addEventListener(this.TRACK_EVENTS[attribute], this, false);
            getAddListener(this._el).call(this._el, this.TRACK_EVENTS[attribute], this, false);
        }

        this.setDoubleGuardState = function (key) {
            doubleGuardState = key;
        };

        this.getDoubleGuardState = function () {
            return doubleGuardState;
        };

        this.destroy = function () {
            for (attribute in this.TRACK_EVENTS) {
                if (this.TRACK_EVENTS.hasOwnProperty(attribute)) {
                    getRemoveEventListener(this._el).call(this._el, this.TRACK_EVENTS[attribute], this);
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
    }


    GestureTracker.prototype = {

        DOUBLE_TAP_TIMEOUT: 300,
        HOLD_TIMEOUT: 350,
        DOUBLE_TAP_TIME_GAP: 300,

        GESTURE_EVENTS: {
            hold: "hold",
            fling: "fling",
            longtap: "longtap",
            tap: "tap",
            doubletap: "doubletap"
        },

        TRACK_EVENTS: {
            up: "pointerup",
            down: "pointerdown",
            move: "pointermove",
            over: "pointerover",
            cancel: "pointercancel"
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
            var isMovedByX, isMovedByY;
            if (
                this.tracks &&
                this.tracks[event.pointerId] &&
                event.timeStamp - this.tracks[event.pointerId].last.timeStamp > 10
            ) {

                isMovedByX = this.tracks[event.pointerId].last.clientX - this.tracks[event.pointerId].pre.clientX > this.MOVE_LIMIT;
                isMovedByY = this.tracks[event.pointerId].last.clientY - this.tracks[event.pointerId].pre.clientY > this.MOVE_LIMIT;
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
        },

        _pointerUp: function (event) {
            clearTimeout(this._holdID);
            if (!this.tracks || !this.tracks[event.pointerId]) {
                return;
            }

            this.tracks[event.pointerId].end.clientX = event.clientX;
            this.tracks[event.pointerId].end.clientY = event.clientY;
            this.tracks[event.pointerId].end.timeStamp = event.timeStamp;
            this._checkGesture(event);
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
                } else if (event.timeStamp - this.firstDownTime < this.DOUBLE_TAP_TIME_GAP) {
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

        _fireDeferredEvent: function(type, event){
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