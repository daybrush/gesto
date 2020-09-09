/*
Copyright (c) 2019 Daybrush
name: @daybrush/drag
license: MIT
author: Daybrush
repository: git+https://github.com/daybrush/drag.git
version: 0.19.1
*/
import { removeEvent, addEvent, now } from '@daybrush/utils';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var __assign = function () {
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
  return getRad([touches[0].clientX, touches[0].clientY], [touches[1].clientX, touches[1].clientY]) / Math.PI * 180;
}
function getPinchDragPosition(clients, prevClients, startClients, startPinchClients) {
  var nowCenter = getAverageClient(clients);
  var prevCenter = getAverageClient(prevClients);
  var startCenter = getAverageClient(startPinchClients);
  var pinchClient = plueClient(startPinchClients[0], minusClient(nowCenter, startCenter));
  var pinchPrevClient = plueClient(startPinchClients[0], minusClient(prevCenter, startCenter));
  return getPosition(pinchClient, pinchPrevClient, startClients[0]);
}
function isMultiTouch(e) {
  return e.touches && e.touches.length >= 2;
}
function getPositionEvent(e) {
  if (e.touches) {
    return getClients(e.touches);
  } else {
    return [getClient(e)];
  }
}
function getPosition(client, prevClient, startClient) {
  var clientX = client.clientX,
      clientY = client.clientY;
  var prevX = prevClient.clientX,
      prevY = prevClient.clientY;
  var startX = startClient.clientX,
      startY = startClient.clientY;
  var deltaX = clientX - prevX;
  var deltaY = clientY - prevY;
  var distX = clientX - startX;
  var distY = clientY - startY;
  return {
    clientX: clientX,
    clientY: clientY,
    deltaX: deltaX,
    deltaY: deltaY,
    distX: distX,
    distY: distY
  };
}
function getDist(clients) {
  return Math.sqrt(Math.pow(clients[0].clientX - clients[1].clientX, 2) + Math.pow(clients[0].clientY - clients[1].clientY, 2));
}
function getPositions(clients, prevClients, startClients) {
  return clients.map(function (client, i) {
    return getPosition(client, prevClients[i], startClients[i]);
  });
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
    clientY: e.clientY
  };
}
function getAverageClient(clients) {
  if (clients.length === 1) {
    return clients[0];
  }

  return {
    clientX: (clients[0].clientX + clients[1].clientX) / 2,
    clientY: (clients[0].clientY + clients[1].clientY) / 2
  };
}
function plueClient(client1, client2) {
  return {
    clientX: client1.clientX + client2.clientX,
    clientY: client1.clientY + client2.clientY
  };
}
function minusClient(client1, client2) {
  return {
    clientX: client1.clientX - client2.clientX,
    clientY: client1.clientY - client2.clientY
  };
}

var INPUT_TAGNAMES = ["textarea", "input"];
/**
 * You can set up drag events in any browser.
 */

var Dragger =
/*#__PURE__*/
function () {
  /**
   *
   */
  function Dragger(targets, options) {
    var _this = this;

    if (options === void 0) {
      options = {};
    }

    this.options = {};
    this.flag = false;
    this.pinchFlag = false;
    this.datas = {};
    this.isDrag = false;
    this.isPinch = false;
    this.isMouse = false;
    this.isTouch = false;
    this.prevClients = [];
    this.startClients = [];
    this.movement = 0;
    this.startPinchClients = [];
    this.startDistance = 0;
    this.customDist = [0, 0];
    this.targets = [];
    this.prevTime = 0;
    this.isDouble = false;
    this.startRotate = 0;
    /**
     * @method
     */

    this.onDragStart = function (e, isTrusted) {
      if (isTrusted === void 0) {
        isTrusted = true;
      }

      if (!_this.flag && e.cancelable === false) {
        return;
      }

      var _a = _this.options,
          container = _a.container,
          pinchOutside = _a.pinchOutside,
          dragstart = _a.dragstart,
          preventRightClick = _a.preventRightClick,
          preventDefault = _a.preventDefault,
          checkInput = _a.checkInput;
      var isTouch = _this.isTouch;

      if (!_this.flag) {
        var activeElement = document.activeElement;
        var target = e.target;
        var tagName = target.tagName.toLowerCase();
        var hasInput = INPUT_TAGNAMES.indexOf(tagName) > -1;
        var hasContentEditable = target.isContentEditable;

        if (hasInput || hasContentEditable) {
          if (checkInput || activeElement === target) {
            // force false or already focused.
            return false;
          }

          if (activeElement && hasContentEditable && activeElement.isContentEditable && activeElement.contains(target)) {
            return false;
          }
        } else if ((preventDefault || e.type === "touchstart") && activeElement) {
          var activeTagName = activeElement.tagName;

          if (activeElement.isContentEditable || INPUT_TAGNAMES.indexOf(activeTagName) > -1) {
            activeElement.blur();
          }
        }
      }

      var timer = 0;

      if (!_this.flag && isTouch && pinchOutside) {
        timer = setTimeout(function () {
          addEvent(container, "touchstart", _this.onDragStart, {
            passive: false
          });
        });
      }

      if (_this.flag && isTouch && pinchOutside) {
        removeEvent(container, "touchstart", _this.onDragStart);
      }

      if (isMultiTouch(e)) {
        clearTimeout(timer);

        if (!_this.flag && e.touches.length !== e.changedTouches.length) {
          return;
        }

        if (!_this.pinchFlag) {
          _this.onPinchStart(e);
        }
      }

      if (_this.flag) {
        return;
      }

      var clients = _this.startClients[0] ? _this.startClients : getPositionEvent(e);
      _this.customDist = [0, 0];
      _this.flag = true;
      _this.isDrag = false;
      _this.startClients = clients;
      _this.prevClients = clients;
      _this.datas = {};
      _this.movement = 0;
      var position = getPosition(clients[0], _this.prevClients[0], _this.startClients[0]);

      if (preventRightClick && (e.which === 3 || e.button === 2)) {
        clearTimeout(timer);

        _this.initDrag();

        return false;
      }

      var result = dragstart && dragstart(__assign({
        type: "dragstart",
        datas: _this.datas,
        inputEvent: e,
        isTrusted: isTrusted
      }, position));

      if (result === false) {
        clearTimeout(timer);

        _this.initDrag();
      }

      _this.isDouble = now() - _this.prevTime < 200;
      _this.flag && preventDefault && e.preventDefault();
    };

    this.onDrag = function (e, isScroll) {
      if (!_this.flag) {
        return;
      }

      var clients = getPositionEvent(e);

      if (_this.pinchFlag) {
        _this.onPinch(e, clients);
      }

      var result = _this.move([0, 0], e, clients);

      if (!result || !result.deltaX && !result.deltaY) {
        return;
      }

      var drag = _this.options.drag;
      drag && drag(__assign({}, result, {
        isScroll: !!isScroll,
        inputEvent: e
      }));
    };

    this.onDragEnd = function (e) {
      if (!_this.flag) {
        return;
      }

      var _a = _this.options,
          dragend = _a.dragend,
          pinchOutside = _a.pinchOutside,
          container = _a.container;

      if (_this.isTouch && pinchOutside) {
        removeEvent(container, "touchstart", _this.onDragStart);
      }

      if (_this.pinchFlag) {
        _this.onPinchEnd(e);
      }

      _this.flag = false;
      var prevClients = _this.prevClients;
      var startClients = _this.startClients;
      var position = _this.pinchFlag ? getPinchDragPosition(prevClients, prevClients, startClients, _this.startPinchClients) : getPosition(prevClients[0], prevClients[0], startClients[0]);
      var currentTime = now();
      var isDouble = !_this.isDrag && _this.isDouble;
      _this.prevTime = _this.isDrag || isDouble ? 0 : currentTime;
      _this.startClients = [];
      _this.prevClients = [];
      dragend && dragend(__assign({
        type: "dragend",
        datas: _this.datas,
        isDouble: isDouble,
        isDrag: _this.isDrag,
        inputEvent: e
      }, position));
    };

    var elements = [].concat(targets);
    this.options = __assign({
      checkInput: false,
      container: elements.length > 1 ? window : elements[0],
      preventRightClick: true,
      preventDefault: true,
      pinchThreshold: 0,
      events: ["touch", "mouse"]
    }, options);
    var _a = this.options,
        container = _a.container,
        events = _a.events;
    this.isTouch = events.indexOf("touch") > -1;
    this.isMouse = events.indexOf("mouse") > -1;
    this.customDist = [0, 0];
    this.targets = elements;

    if (this.isMouse) {
      elements.forEach(function (el) {
        addEvent(el, "mousedown", _this.onDragStart);
      });
      addEvent(container, "mousemove", this.onDrag);
      addEvent(container, "mouseup", this.onDragEnd);
      addEvent(container, "contextmenu", this.onDragEnd);
    }

    if (this.isTouch) {
      var passive_1 = {
        passive: false
      };
      elements.forEach(function (el) {
        addEvent(el, "touchstart", _this.onDragStart, passive_1);
      });
      addEvent(container, "touchmove", this.onDrag, passive_1);
      addEvent(container, "touchend", this.onDragEnd, passive_1);
      addEvent(container, "touchcancel", this.onDragEnd, passive_1);
    }
  }
  /**
   *
   */


  var __proto = Dragger.prototype;

  __proto.isDragging = function () {
    return this.isDrag;
  };
  /**
   *
   */


  __proto.isFlag = function () {
    return this.flag;
  };
  /**
   *
   */


  __proto.isPinchFlag = function () {
    return this.pinchFlag;
  };
  /**
   *
   */


  __proto.isPinching = function () {
    return this.isPinch;
  };
  /**
   *
   */


  __proto.scrollBy = function (deltaX, deltaY, e, isCallDrag) {
    if (isCallDrag === void 0) {
      isCallDrag = true;
    }

    if (!this.flag) {
      return;
    }

    this.startClients.forEach(function (client) {
      client.clientX -= deltaX;
      client.clientY -= deltaY;
    });
    this.prevClients.forEach(function (client) {
      client.clientX -= deltaX;
      client.clientY -= deltaY;
    });
    isCallDrag && this.onDrag(e, true);
  };

  __proto.move = function (_a, inputEvent, clients) {
    var deltaX = _a[0],
        deltaY = _a[1];

    if (clients === void 0) {
      clients = this.prevClients;
    }

    var customDist = this.customDist;
    var prevClients = this.prevClients;
    var startClients = this.startClients;
    var position = this.pinchFlag ? getPinchDragPosition(clients, prevClients, startClients, this.startPinchClients) : getPosition(clients[0], prevClients[0], startClients[0]);
    customDist[0] += deltaX;
    customDist[1] += deltaY;
    position.deltaX += deltaX;
    position.deltaY += deltaY;
    var positionDeltaX = position.deltaX,
        positionDeltaY = position.deltaY;
    position.distX += customDist[0];
    position.distY += customDist[1];
    this.movement += Math.sqrt(positionDeltaX * positionDeltaX + positionDeltaY * positionDeltaY);
    this.prevClients = clients;
    this.isDrag = true;
    return __assign({
      type: "drag",
      datas: this.datas
    }, position, {
      movement: this.movement,
      isDrag: this.isDrag,
      isPinch: this.isPinch,
      isScroll: false,
      inputEvent: inputEvent
    });
  };

  __proto.onPinchStart = function (e) {
    var _a, _b;

    var _c = this.options,
        pinchstart = _c.pinchstart,
        pinchThreshold = _c.pinchThreshold;

    if (this.isDrag && this.movement > pinchThreshold) {
      return;
    }

    var pinchClients = getClients(e.changedTouches);
    this.pinchFlag = true;

    (_a = this.startClients).push.apply(_a, pinchClients);

    (_b = this.prevClients).push.apply(_b, pinchClients);

    this.startDistance = getDist(this.prevClients);
    this.startPinchClients = this.prevClients.slice();

    if (!pinchstart) {
      return;
    }

    var startClients = this.prevClients;
    var startAverageClient = getAverageClient(startClients);
    var centerPosition = getPosition(startAverageClient, startAverageClient, startAverageClient);
    this.startRotate = getRotatiion(startClients);
    pinchstart(__assign({
      type: "pinchstart",
      datas: this.datas,
      angle: this.startRotate,
      touches: getPositions(startClients, startClients, startClients)
    }, centerPosition, {
      inputEvent: e
    }));
  };

  __proto.onPinch = function (e, clients) {
    if (!this.flag || !this.pinchFlag || clients.length < 2) {
      return;
    }

    this.isPinch = true;
    var pinch = this.options.pinch;

    if (!pinch) {
      return;
    }

    var prevClients = this.prevClients;
    var startClients = this.startClients;
    var centerPosition = getPosition(getAverageClient(clients), getAverageClient(prevClients), getAverageClient(startClients));
    var angle = getRotatiion(clients);
    var distance = getDist(clients);
    pinch(__assign({
      type: "pinch",
      datas: this.datas,
      movement: this.movement,
      angle: angle,
      rotation: angle - this.startRotate,
      touches: getPositions(clients, prevClients, startClients),
      scale: distance / this.startDistance,
      distance: distance
    }, centerPosition, {
      inputEvent: e
    }));
  };

  __proto.onPinchEnd = function (e) {
    if (!this.flag || !this.pinchFlag) {
      return;
    }

    var isPinch = this.isPinch;
    this.isPinch = false;
    this.pinchFlag = false;
    var pinchend = this.options.pinchend;

    if (!pinchend) {
      return;
    }

    var prevClients = this.prevClients;
    var startClients = this.startClients;
    var centerPosition = getPosition(getAverageClient(prevClients), getAverageClient(prevClients), getAverageClient(startClients));
    pinchend(__assign({
      type: "pinchend",
      datas: this.datas,
      isPinch: isPinch,
      touches: getPositions(prevClients, prevClients, startClients)
    }, centerPosition, {
      inputEvent: e
    }));
    this.isPinch = false;
    this.pinchFlag = false;
  };

  __proto.triggerDragStart = function (e) {
    this.onDragStart(e, false);
  };
  /**
   *
   */


  __proto.unset = function () {
    var _this = this;

    var targets = this.targets;
    var container = this.options.container;

    if (this.isMouse) {
      targets.forEach(function (target) {
        removeEvent(target, "mousedown", _this.onDragStart);
      });
      removeEvent(container, "mousemove", this.onDrag);
      removeEvent(container, "mouseup", this.onDragEnd);
      removeEvent(container, "contextmenu", this.onDragEnd);
    }

    if (this.isTouch) {
      targets.forEach(function (target) {
        removeEvent(target, "touchstart", _this.onDragStart);
      });
      removeEvent(container, "touchstart", this.onDragStart);
      removeEvent(container, "touchmove", this.onDrag);
      removeEvent(container, "touchend", this.onDragEnd);
      removeEvent(container, "touchcancel", this.onDragEnd);
    }
  };

  __proto.initDrag = function () {
    this.startClients = [];
    this.prevClients = [];
    this.flag = false;
  };

  return Dragger;
}();

function setDrag(el, options) {
  return new Dragger(el, options);
}

export default Dragger;
export { setDrag as drag };
//# sourceMappingURL=drag.esm.js.map
