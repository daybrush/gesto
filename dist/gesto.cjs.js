/*
Copyright (c) 2019 Daybrush
name: gesto
license: MIT
author: Daybrush
repository: git+https://github.com/daybrush/gesto.git
version: 1.15.1
*/
'use strict';

var EventEmitter = require('@scena/event-emitter');
var utils = require('@daybrush/utils');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function getRad(pos1, pos2) {
    var distX = pos2[0] - pos1[0];
    var distY = pos2[1] - pos1[1];
    var rad = Math.atan2(distY, distX);
    return rad >= 0 ? rad : rad + Math.PI * 2;
}
function getRotatiion(touches) {
    return getRad([
        touches[0].clientX,
        touches[0].clientY,
    ], [
        touches[1].clientX,
        touches[1].clientY,
    ]) / Math.PI * 180;
}
function isMultiTouch(e) {
    return e.touches && e.touches.length >= 2;
}
function getEventClients(e) {
    if (!e) {
        return [];
    }
    if (e.touches) {
        return getClients(e.touches);
    }
    else {
        return [getClient(e)];
    }
}
function isMouseEvent(e) {
    return e && (e.type.indexOf("mouse") > -1 || "button" in e);
}
function getPosition(clients, prevClients, startClients) {
    var length = startClients.length;
    var _a = getAverageClient(clients, length), clientX = _a.clientX, clientY = _a.clientY, originalClientX = _a.originalClientX, originalClientY = _a.originalClientY;
    var _b = getAverageClient(prevClients, length), prevX = _b.clientX, prevY = _b.clientY;
    var _c = getAverageClient(startClients, length), startX = _c.clientX, startY = _c.clientY;
    var deltaX = clientX - prevX;
    var deltaY = clientY - prevY;
    var distX = clientX - startX;
    var distY = clientY - startY;
    return {
        clientX: originalClientX,
        clientY: originalClientY,
        deltaX: deltaX,
        deltaY: deltaY,
        distX: distX,
        distY: distY,
    };
}
function getDist(clients) {
    return Math.sqrt(Math.pow(clients[0].clientX - clients[1].clientX, 2)
        + Math.pow(clients[0].clientY - clients[1].clientY, 2));
}
function getClients(touches) {
    var length = Math.min(touches.length, 2);
    var clients = [];
    for (var i = 0; i < length; ++i) {
        clients.push(getClient(touches[i]));
    }
    return clients;
}
function getClient(e) {
    return {
        clientX: e.clientX,
        clientY: e.clientY,
    };
}
function getAverageClient(clients, length) {
    if (length === void 0) { length = clients.length; }
    var sumClient = {
        clientX: 0,
        clientY: 0,
        originalClientX: 0,
        originalClientY: 0,
    };
    for (var i = 0; i < length; ++i) {
        var client = clients[i];
        sumClient.originalClientX += "originalClientX" in client ? client.originalClientX : client.clientX;
        sumClient.originalClientY += "originalClientY" in client ? client.originalClientY : client.clientY;
        sumClient.clientX += client.clientX;
        sumClient.clientY += client.clientY;
    }
    if (!length) {
        return sumClient;
    }
    return {
        clientX: sumClient.clientX / length,
        clientY: sumClient.clientY / length,
        originalClientX: sumClient.originalClientX / length,
        originalClientY: sumClient.originalClientY / length,
    };
}

var ClientStore = /*#__PURE__*/ (function () {
    function ClientStore(clients) {
        this.prevClients = [];
        this.startClients = [];
        this.movement = 0;
        this.length = 0;
        this.startClients = clients;
        this.prevClients = clients;
        this.length = clients.length;
    }
    ClientStore.prototype.getAngle = function (clients) {
        if (clients === void 0) { clients = this.prevClients; }
        return getRotatiion(clients);
    };
    ClientStore.prototype.getRotation = function (clients) {
        if (clients === void 0) { clients = this.prevClients; }
        return getRotatiion(clients) - getRotatiion(this.startClients);
    };
    ClientStore.prototype.getPosition = function (clients, isAdd) {
        if (clients === void 0) { clients = this.prevClients; }
        var position = getPosition(clients || this.prevClients, this.prevClients, this.startClients);
        var deltaX = position.deltaX, deltaY = position.deltaY;
        this.movement += Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        this.prevClients = clients;
        return position;
    };
    ClientStore.prototype.getPositions = function (clients) {
        if (clients === void 0) { clients = this.prevClients; }
        var prevClients = this.prevClients;
        return this.startClients.map(function (startClient, i) { return getPosition([clients[i]], [prevClients[i]], [startClient]); });
    };
    ClientStore.prototype.getMovement = function (clients) {
        var movement = this.movement;
        if (!clients) {
            return movement;
        }
        var currentClient = getAverageClient(clients, this.length);
        var prevClient = getAverageClient(this.prevClients, this.length);
        var deltaX = currentClient.clientX - prevClient.clientX;
        var deltaY = currentClient.clientY - prevClient.clientY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY) + movement;
    };
    ClientStore.prototype.getDistance = function (clients) {
        if (clients === void 0) { clients = this.prevClients; }
        return getDist(clients);
    };
    ClientStore.prototype.getScale = function (clients) {
        if (clients === void 0) { clients = this.prevClients; }
        return getDist(clients) / getDist(this.startClients);
    };
    ClientStore.prototype.move = function (deltaX, deltaY) {
        this.startClients.forEach(function (client) {
            client.clientX -= deltaX;
            client.clientY -= deltaY;
        });
        this.prevClients.forEach(function (client) {
            client.clientX -= deltaX;
            client.clientY -= deltaY;
        });
    };
    return ClientStore;
}());

var INPUT_TAGNAMES = ["textarea", "input"];
/**
 * You can set up drag, pinch events in any browser.
 */
var Gesto = /*#__PURE__*/ (function (_super) {
    __extends(Gesto, _super);
    /**
     *
     */
    function Gesto(targets, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = {};
        _this.flag = false;
        _this.pinchFlag = false;
        _this.data = {};
        _this.isDrag = false;
        _this.isPinch = false;
        _this.isMouse = false;
        _this.isTouch = false;
        _this.clientStores = [];
        _this.targets = [];
        _this.prevTime = 0;
        _this.doubleFlag = false;
        _this._dragFlag = false;
        _this._isTrusted = false;
        _this._isMouseEvent = false;
        _this._isSecondaryButton = false;
        _this._preventMouseEvent = false;
        _this._prevInputEvent = null;
        _this.onDragStart = function (e, isTrusted) {
            if (isTrusted === void 0) { isTrusted = true; }
            if (!_this.flag && e.cancelable === false) {
                return;
            }
            var _a = _this.options, container = _a.container, pinchOutside = _a.pinchOutside, preventWheelClick = _a.preventWheelClick, preventRightClick = _a.preventRightClick, preventDefault = _a.preventDefault, checkInput = _a.checkInput, preventClickEventOnDragStart = _a.preventClickEventOnDragStart, preventClickEventOnDrag = _a.preventClickEventOnDrag, preventClickEventByCondition = _a.preventClickEventByCondition;
            var isTouch = _this.isTouch;
            var isDragStart = !_this.flag;
            _this._isSecondaryButton = e.which === 3 || e.button === 2;
            if ((preventWheelClick && (e.which === 2 || e.button === 1))
                || (preventRightClick && (e.which === 3 || e.button === 2))) {
                _this.stop();
                return false;
            }
            if (isDragStart) {
                var activeElement = document.activeElement;
                var target = e.target;
                if (target) {
                    var tagName = target.tagName.toLowerCase();
                    var hasInput = INPUT_TAGNAMES.indexOf(tagName) > -1;
                    var hasContentEditable = target.isContentEditable;
                    if (hasInput || hasContentEditable) {
                        if (checkInput || activeElement === target) {
                            // force false or already focused.
                            return false;
                        }
                        // no focus
                        if (activeElement
                            && hasContentEditable
                            && activeElement.isContentEditable
                            && activeElement.contains(target)) {
                            return false;
                        }
                    }
                    else if ((preventDefault || e.type === "touchstart") && activeElement) {
                        var activeTagName = activeElement.tagName.toLowerCase();
                        if (activeElement.isContentEditable || INPUT_TAGNAMES.indexOf(activeTagName) > -1) {
                            activeElement.blur();
                        }
                    }
                    if (preventClickEventOnDragStart || preventClickEventOnDrag || preventClickEventByCondition) {
                        utils.addEvent(window, "click", _this._onClick, true);
                    }
                }
                _this.clientStores = [new ClientStore(getEventClients(e))];
                _this.flag = true;
                _this.isDrag = false;
                _this._isTrusted = isTrusted;
                _this._dragFlag = true;
                _this._prevInputEvent = e;
                _this.data = {};
                _this.doubleFlag = utils.now() - _this.prevTime < 200;
                _this._isMouseEvent = isMouseEvent(e);
                if (!_this._isMouseEvent && _this._preventMouseEvent) {
                    _this._preventMouseEvent = false;
                }
                var result = _this._preventMouseEvent || _this.emit("dragStart", __assign(__assign({ data: _this.data, datas: _this.data, inputEvent: e, isMouseEvent: _this._isMouseEvent, isSecondaryButton: _this._isSecondaryButton, isTrusted: isTrusted, isDouble: _this.doubleFlag }, _this.getCurrentStore().getPosition()), { preventDefault: function () {
                        e.preventDefault();
                    }, preventDrag: function () {
                        _this._dragFlag = false;
                    } }));
                if (result === false) {
                    _this.stop();
                }
                if (_this._isMouseEvent && _this.flag && preventDefault) {
                    e.preventDefault();
                }
            }
            if (!_this.flag) {
                return false;
            }
            var timer = 0;
            if (isDragStart) {
                _this._attchDragEvent();
                // wait pinch
                if (isTouch && pinchOutside) {
                    timer = setTimeout(function () {
                        utils.addEvent(container, "touchstart", _this.onDragStart, {
                            passive: false
                        });
                    });
                }
            }
            else if (isTouch && pinchOutside) {
                // pinch is occured
                utils.removeEvent(container, "touchstart", _this.onDragStart);
            }
            if (_this.flag && isMultiTouch(e)) {
                clearTimeout(timer);
                if (isDragStart && (e.touches.length !== e.changedTouches.length)) {
                    return;
                }
                if (!_this.pinchFlag) {
                    _this.onPinchStart(e);
                }
            }
        };
        _this.onDrag = function (e, isScroll) {
            if (!_this.flag) {
                return;
            }
            var preventDefault = _this.options.preventDefault;
            if (!_this._isMouseEvent && preventDefault) {
                e.preventDefault();
            }
            _this._prevInputEvent = e;
            var clients = getEventClients(e);
            var result = _this.moveClients(clients, e, false);
            if (_this._dragFlag) {
                if (_this.pinchFlag || result.deltaX || result.deltaY) {
                    var dragResult = _this._preventMouseEvent || _this.emit("drag", __assign(__assign({}, result), { isScroll: !!isScroll, inputEvent: e }));
                    if (dragResult === false) {
                        _this.stop();
                        return;
                    }
                }
                if (_this.pinchFlag) {
                    _this.onPinch(e, clients);
                }
            }
            _this.getCurrentStore().getPosition(clients, true);
        };
        _this.onDragEnd = function (e) {
            if (!_this.flag) {
                return;
            }
            var _a = _this.options, pinchOutside = _a.pinchOutside, container = _a.container, preventClickEventOnDrag = _a.preventClickEventOnDrag, preventClickEventOnDragStart = _a.preventClickEventOnDragStart, preventClickEventByCondition = _a.preventClickEventByCondition;
            var isDrag = _this.isDrag;
            if (preventClickEventOnDrag || preventClickEventOnDragStart || preventClickEventByCondition) {
                requestAnimationFrame(function () {
                    _this._allowClickEvent();
                });
            }
            if (!preventClickEventByCondition && !preventClickEventOnDragStart && preventClickEventOnDrag && !isDrag) {
                _this._allowClickEvent();
            }
            if (_this.isTouch && pinchOutside) {
                utils.removeEvent(container, "touchstart", _this.onDragStart);
            }
            if (_this.pinchFlag) {
                _this.onPinchEnd(e);
            }
            var clients = (e === null || e === void 0 ? void 0 : e.touches) ? getEventClients(e) : [];
            var clientsLength = clients.length;
            if (clientsLength === 0 || !_this.options.keepDragging) {
                _this.flag = false;
            }
            else {
                _this._addStore(new ClientStore(clients));
            }
            var position = _this._getPosition();
            var currentTime = utils.now();
            var isDouble = !isDrag && _this.doubleFlag;
            _this._prevInputEvent = null;
            _this.prevTime = isDrag || isDouble ? 0 : currentTime;
            if (!_this.flag) {
                _this._dettachDragEvent();
                _this._preventMouseEvent || _this.emit("dragEnd", __assign({ data: _this.data, datas: _this.data, isDouble: isDouble, isDrag: isDrag, isClick: !isDrag, isMouseEvent: _this._isMouseEvent, isSecondaryButton: _this._isSecondaryButton, inputEvent: e, isTrusted: _this._isTrusted }, position));
                _this.clientStores = [];
                if (!_this._isMouseEvent) {
                    _this._preventMouseEvent = true;
                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                            _this._preventMouseEvent = false;
                        });
                    });
                }
            }
        };
        _this.onBlur = function () {
            _this.onDragEnd();
        };
        _this._allowClickEvent = function () {
            utils.removeEvent(window, "click", _this._onClick, true);
        };
        _this._onClick = function (e) {
            _this._allowClickEvent();
            _this._preventMouseEvent = false;
            var preventClickEventByCondition = _this.options.preventClickEventByCondition;
            if (preventClickEventByCondition === null || preventClickEventByCondition === void 0 ? void 0 : preventClickEventByCondition(e)) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
        };
        _this._onContextMenu = function (e) {
            var options = _this.options;
            if (!options.preventRightClick) {
                e.preventDefault();
            }
            else {
                _this.onDragEnd(e);
            }
        };
        _this._passCallback = function () { };
        var elements = [].concat(targets);
        _this.options = __assign({ checkInput: false, container: elements.length > 1 ? window : elements[0], preventRightClick: true, preventWheelClick: true, preventClickEventOnDragStart: false, preventClickEventOnDrag: false, preventClickEventByCondition: null, preventDefault: true, checkWindowBlur: false, keepDragging: false, pinchThreshold: 0, events: ["touch", "mouse"] }, options);
        var _a = _this.options, container = _a.container, events = _a.events, checkWindowBlur = _a.checkWindowBlur;
        _this.isTouch = events.indexOf("touch") > -1;
        _this.isMouse = events.indexOf("mouse") > -1;
        _this.targets = elements;
        if (_this.isMouse) {
            elements.forEach(function (el) {
                utils.addEvent(el, "mousedown", _this.onDragStart);
                utils.addEvent(el, "mousemove", _this._passCallback);
            });
            utils.addEvent(container, "contextmenu", _this._onContextMenu);
        }
        if (checkWindowBlur) {
            utils.addEvent(window, "blur", _this.onBlur);
        }
        if (_this.isTouch) {
            var passive_1 = {
                passive: false,
            };
            elements.forEach(function (el) {
                utils.addEvent(el, "touchstart", _this.onDragStart, passive_1);
                utils.addEvent(el, "touchmove", _this._passCallback, passive_1);
            });
        }
        return _this;
    }
    /**
     * Stop Gesto's drag events.
     */
    Gesto.prototype.stop = function () {
        this.isDrag = false;
        this.data = {};
        this.clientStores = [];
        this.pinchFlag = false;
        this.doubleFlag = false;
        this.prevTime = 0;
        this.flag = false;
        this._allowClickEvent();
        this._dettachDragEvent();
    };
    /**
     * The total moved distance
     */
    Gesto.prototype.getMovement = function (clients) {
        return this.getCurrentStore().getMovement(clients) + this.clientStores.slice(1).reduce(function (prev, cur) {
            return prev + cur.movement;
        }, 0);
    };
    /**
     * Whether to drag
     */
    Gesto.prototype.isDragging = function () {
        return this.isDrag;
    };
    /**
     * Whether to start drag
     */
    Gesto.prototype.isFlag = function () {
        return this.flag;
    };
    /**
     * Whether to start pinch
     */
    Gesto.prototype.isPinchFlag = function () {
        return this.pinchFlag;
    };
    /**
     * Whether to start double click
     */
    Gesto.prototype.isDoubleFlag = function () {
        return this.doubleFlag;
    };
    /**
     * Whether to pinch
     */
    Gesto.prototype.isPinching = function () {
        return this.isPinch;
    };
    /**
     * If a scroll event occurs, it is corrected by the scroll distance.
     */
    Gesto.prototype.scrollBy = function (deltaX, deltaY, e, isCallDrag) {
        if (isCallDrag === void 0) { isCallDrag = true; }
        if (!this.flag) {
            return;
        }
        this.clientStores[0].move(deltaX, deltaY);
        isCallDrag && this.onDrag(e, true);
    };
    /**
     * Create a virtual drag event.
     */
    Gesto.prototype.move = function (_a, inputEvent) {
        var deltaX = _a[0], deltaY = _a[1];
        var store = this.getCurrentStore();
        var nextClients = store.prevClients;
        return this.moveClients(nextClients.map(function (_a) {
            var clientX = _a.clientX, clientY = _a.clientY;
            return {
                clientX: clientX + deltaX,
                clientY: clientY + deltaY,
                originalClientX: clientX,
                originalClientY: clientY,
            };
        }), inputEvent, true);
    };
    /**
     * The dragStart event is triggered by an external event.
     */
    Gesto.prototype.triggerDragStart = function (e) {
        this.onDragStart(e, false);
    };
    /**
     * Set the event data while dragging.
     */
    Gesto.prototype.setEventData = function (data) {
        var currentData = this.data;
        for (var name_1 in data) {
            currentData[name_1] = data[name_1];
        }
        return this;
    };
    /**
     * Set the event data while dragging.
     * Use `setEventData`
     * @deprecated
     */
    Gesto.prototype.setEventDatas = function (data) {
        return this.setEventData(data);
    };
    /**
     * Get the current event state while dragging.
     */
    Gesto.prototype.getCurrentEvent = function (inputEvent) {
        if (inputEvent === void 0) { inputEvent = this._prevInputEvent; }
        return __assign(__assign({ data: this.data, datas: this.data }, this._getPosition()), { movement: this.getMovement(), isDrag: this.isDrag, isPinch: this.isPinch, isScroll: false, inputEvent: inputEvent });
    };
    /**
     * Get & Set the event data while dragging.
     */
    Gesto.prototype.getEventData = function () {
        return this.data;
    };
    /**
     * Get & Set the event data while dragging.
     * Use getEventData method
     * @depreacated
     */
    Gesto.prototype.getEventDatas = function () {
        return this.data;
    };
    /**
     * Unset Gesto
     */
    Gesto.prototype.unset = function () {
        var _this = this;
        var targets = this.targets;
        var container = this.options.container;
        this.off();
        utils.removeEvent(window, "blur", this.onBlur);
        if (this.isMouse) {
            targets.forEach(function (target) {
                utils.removeEvent(target, "mousedown", _this.onDragStart);
            });
            utils.removeEvent(container, "contextmenu", this._onContextMenu);
        }
        if (this.isTouch) {
            targets.forEach(function (target) {
                utils.removeEvent(target, "touchstart", _this.onDragStart);
            });
            utils.removeEvent(container, "touchstart", this.onDragStart);
        }
        this._prevInputEvent = null;
        this._allowClickEvent();
        this._dettachDragEvent();
    };
    Gesto.prototype.onPinchStart = function (e) {
        var pinchThreshold = this.options.pinchThreshold;
        if (this.isDrag && this.getMovement() > pinchThreshold) {
            return;
        }
        var store = new ClientStore(getEventClients(e));
        this.pinchFlag = true;
        this._addStore(store);
        var result = this.emit("pinchStart", __assign(__assign({ data: this.data, datas: this.data, angle: store.getAngle(), touches: this.getCurrentStore().getPositions() }, store.getPosition()), { inputEvent: e, isTrusted: this._isTrusted }));
        if (result === false) {
            this.pinchFlag = false;
        }
    };
    Gesto.prototype.onPinch = function (e, clients) {
        if (!this.flag || !this.pinchFlag || clients.length < 2) {
            return;
        }
        var store = this.getCurrentStore();
        this.isPinch = true;
        this.emit("pinch", __assign(__assign({ data: this.data, datas: this.data, movement: this.getMovement(clients), angle: store.getAngle(clients), rotation: store.getRotation(clients), touches: store.getPositions(clients), scale: store.getScale(clients), distance: store.getDistance(clients) }, store.getPosition(clients)), { inputEvent: e, isTrusted: this._isTrusted }));
    };
    Gesto.prototype.onPinchEnd = function (e) {
        if (!this.pinchFlag) {
            return;
        }
        var isPinch = this.isPinch;
        this.isPinch = false;
        this.pinchFlag = false;
        var store = this.getCurrentStore();
        this.emit("pinchEnd", __assign(__assign({ data: this.data, datas: this.data, isPinch: isPinch, touches: store.getPositions() }, store.getPosition()), { inputEvent: e }));
    };
    Gesto.prototype.getCurrentStore = function () {
        return this.clientStores[0];
    };
    Gesto.prototype.moveClients = function (clients, inputEvent, isAdd) {
        var position = this._getPosition(clients, isAdd);
        var isPrevDrag = this.isDrag;
        if (position.deltaX || position.deltaY) {
            this.isDrag = true;
        }
        var isFirstDrag = false;
        if (!isPrevDrag && this.isDrag) {
            isFirstDrag = true;
        }
        return __assign(__assign({ data: this.data, datas: this.data }, position), { movement: this.getMovement(clients), isDrag: this.isDrag, isPinch: this.isPinch, isScroll: false, isMouseEvent: this._isMouseEvent, isSecondaryButton: this._isSecondaryButton, inputEvent: inputEvent, isTrusted: this._isTrusted, isFirstDrag: isFirstDrag });
    };
    Gesto.prototype._addStore = function (store) {
        this.clientStores.splice(0, 0, store);
    };
    Gesto.prototype._getPosition = function (clients, isAdd) {
        var store = this.getCurrentStore();
        var position = store.getPosition(clients, isAdd);
        var _a = this.clientStores.slice(1).reduce(function (prev, cur) {
            var storePosition = cur.getPosition();
            prev.distX += storePosition.distX;
            prev.distY += storePosition.distY;
            return prev;
        }, position), distX = _a.distX, distY = _a.distY;
        return __assign(__assign({}, position), { distX: distX, distY: distY });
    };
    Gesto.prototype._attchDragEvent = function () {
        var container = this.options.container;
        var passive = {
            passive: false
        };
        if (this.isMouse) {
            utils.addEvent(container, "mousemove", this.onDrag);
            utils.addEvent(container, "mouseup", this.onDragEnd);
        }
        if (this.isTouch) {
            utils.addEvent(container, "touchmove", this.onDrag, passive);
            utils.addEvent(container, "touchend", this.onDragEnd, passive);
            utils.addEvent(container, "touchcancel", this.onDragEnd, passive);
        }
    };
    Gesto.prototype._dettachDragEvent = function () {
        var container = this.options.container;
        if (this.isMouse) {
            utils.removeEvent(container, "mousemove", this.onDrag);
            utils.removeEvent(container, "mouseup", this.onDragEnd);
        }
        if (this.isTouch) {
            utils.removeEvent(container, "touchstart", this.onDragStart);
            utils.removeEvent(container, "touchmove", this.onDrag);
            utils.removeEvent(container, "touchend", this.onDragEnd);
            utils.removeEvent(container, "touchcancel", this.onDragEnd);
        }
    };
    return Gesto;
}(EventEmitter));

var modules = {
    __proto__: null,
    default: Gesto
};

for (var name_1 in modules) {
    Gesto[name_1] = modules[name_1];
}

module.exports = Gesto;
//# sourceMappingURL=gesto.cjs.js.map
