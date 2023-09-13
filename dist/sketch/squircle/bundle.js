(function (p5_createLoop, p5) {
  'use strict';

  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  /**
   * Ease function adapted from processing
   * @param {float} p the var (between 0 & 1) to ease
   * @author beesandbombs https://gist.github.com/beesandbombs
   */

  var ease = function ease(p) {
    var g = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (g) {
      return p < 0.5 ? 0.5 * Math.pow(2 * p, g) : 1 - 0.5 * Math.pow(2 * (1 - p), g);
    } else {
      return 3 * p * p - 2 * p * p * p;
    }
  };

  /**
   * Utility function to create slider to change a sketch parameter
   *
   * @param {object} param initialization object
   * paramter name : {
   *      value: init parameter value,
   *      options : {
   *         min: minimum parameter value,
   *         max: maximum value,
   *         step: step to increment value  
   *         label: explicit name or false
   *      },
   *      callback: a function to call on change
   * }
   * If you want to call a function after param change,
   * you have to set a sketch.init function
   */
  var paramSlider = function paramSlider(param) {
    var paramName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var label = '';
    if (param.options.label) {
      label = document.createElement('label');
      label.innerHTML = param.options.label;
    }
    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = param.options.min;
    slider.max = param.options.max;
    slider.step = param.options.step;
    slider.value = param.value;
    if (paramName) {
      slider.name = paramName;
    }
    var value = document.createElement('input');
    value.type = 'text';
    value.value = param.value;
    if (param.callBack !== undefined) {
      slider.addEventListener('change', function (event) {
        param.value = Number(event.target.value);
        value.value = event.target.value;
        console.log(param.value);
        /*
        if ( param.callBack !== 'undefined') {
            param.callBack()
        }
        */
      });
    }

    return [label, slider, value];
  };

  /**
   * Generate multiple colors
   *
   * Caution: to use in p5 you have to se the colorMode to HSL, 360, 100, 100, 100
   *
   * @param {int} saturation in percent the saturation of the returned colors
   * @param {int} lightness in percent the brightness value of generated colors
   * @param {int} alpha in percent the alpha value of returned colors
   * @param {int} amount how many color you want
   */
  var generateHslaColors = function generateHslaColors() {
    var saturation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 75;
    var lightness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 75;
    var alpha = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;
    var amount = arguments.length > 3 ? arguments[3] : undefined;
    var colors = [];
    var hueBegin = Math.floor(Math.random() * 360);
    var hueDelta = Math.trunc(360 / amount);
    var hue = hueBegin;
    for (var i = 0; i < amount; i++) {
      hue += hueDelta;
      hue = hue > 360 ? hue % 360 : hue;
      colors.push([hue, saturation, lightness, alpha]);
    }
    return colors;
  };

  var radius;
  var colors, isRecording;
  var framesPerSecond = 24;
  var numFrame = 60;
  var sketchSize = function sketchSize() {
    var side = Math.min(window.innerWidth, window.innerHeight);
    return {
      w: side > 800 ? 800 : side * 0.85,
      h: side > 800 ? 800 : side * 0.85
    };
  };
  var urlParams = new URLSearchParams(location.search);
  isRecording = urlParams.get('resolution') && urlParams.get('transition');
  var params = {
    transition: {
      value: urlParams.get('transition') || 5,
      options: {
        min: 1,
        max: 15,
        step: 0.1,
        label: 'Morphing smoothing'
      }
    },
    resolution: {
      value: urlParams.get('resolution') || 0.5,
      options: {
        min: 0.1,
        max: 0.5,
        step: 0.1,
        label: 'Resolution'
      }
    }
  };
  var gifOptions = {
    quality: 10,
    render: false,
    download: true,
    fileName: 'squircle.gif'
  };
  var windowFrame$1 = document.getElementById('windowFrame');
  var squircle = function squircle(p5) {
    p5.setup = function () {
      var canvasSize = sketchSize();
      p5.createCanvas(canvasSize.w, canvasSize.h);
      p5.frameRate(framesPerSecond);
      p5.colorMode(p5.HSL, 360, 100, 100, 100);
      if (isRecording) {
        p5.createLoop({
          gif: _objectSpread2({}, gifOptions),
          duration: numFrame / framesPerSecond,
          framesPerSecond: framesPerSecond
        });
      }
      radius = Math.min(p5.width, p5.height) / 8;
      var paramBox = document.createElement('div');
      paramBox.id = 'interactiveParameter';
      for (var i in params) {
        var elems = paramSlider(_objectSpread2(_objectSpread2({}, params[i]), {}, {
          callback: window.init
        }), i);
        elems.forEach(function (elem) {
          paramBox.appendChild(elem);
        });
      }
      var exportButton = document.createElement('input');
      exportButton.type = 'submit';
      exportButton.value = isRecording ? 'GIF is processing' : 'Download as a GIF';
      paramBox.appendChild(exportButton);
      windowFrame$1.appendChild(paramBox);
      squircle.init();
      p5.noFill();
    };
    p5.draw = function () {
      p5.background(0);
      var t = p5.frameCount % numFrame / numFrame;
      var tt = t <= 0.5 ? t + t : 2 - (t + t);
      var rot = 2 * Math.PI * ease(1 - t * t, params['transition'].value);
      for (var i = 0; i < 1; i += params['resolution'].value / 4) {
        var theta1 = Math.PI * 2 * i;
        var rR = radius * Math.min(1 / Math.abs(Math.cos(theta1)), 1 / Math.abs(Math.sin(theta1)));
        var r = p5.lerp(radius, rR, ease(tt, params['transition'].value));
        var x = p5.width / 2 + r * Math.cos(theta1 + rot);
        var y = p5.height / 2 + r * Math.sin(theta1 + rot);
        var colorIndex = Math.round(1 / params['resolution'].value * i);
        p5.stroke(colors[colorIndex % colors.length]);
        p5.fill(colors[colorIndex % colors.length]);
        p5.beginShape();
        for (var j = 0; j < 1; j += params['resolution'].value / 4) {
          var theta2 = Math.PI * 2 * j;
          var _rR = radius;
          var _r = p5.lerp(radius, _rR / 2, ease(tt));
          var _x = x + _r * Math.cos(theta2 + rot);
          var _y = y + _r * Math.sin(theta2 + rot);
          p5.vertex(_x, _y);
        }
        p5.endShape(p5.CLOSE);
      }
    };
    squircle.init = function () {
      colors = generateHslaColors(80, 60, 50, Math.round(1 / params['resolution'].value)).map(function (c) {
        return p5.color(c[0], c[1], c[2], c[3]);
      });
      p5.strokeWeight(p5.map(params['resolution'].value, 0.1, 0.5, 1.5, 3));
    };
  };

  var infobox = function infobox() {
    var infoBoxElement = document.getElementById('infobox');
    if (infoBoxElement != null) {
      infoBoxElement.classList.toggle('active');
    }
  };

  var chars = [].concat(_toConsumableArray('0123456789'), _toConsumableArray(':/*|&#@$!<>'), _toConsumableArray('{}[]+-_^~%?;()'));
  var duration = 45;
  var GlitchText = /*#__PURE__*/function () {
    function GlitchText(property) {
      var _this = this;
      _classCallCheck(this, GlitchText);
      this.element = property.element;
      this.trueText = property.element.innerText || property.element.innerHTML;
      this.numChar = this.trueText.length;
      this.effect = property.effect;
      this.curChar = 0;
      this.biteChar = '';
      for (var i = 0; i < this.numChar; i++) {
        var charAtI = this.trueText.substr(i, 1);
        if (charAtI && charAtI === ' ') {
          this.biteChar += ' ';
        } else {
          this.biteChar += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      this.element.innerHTML = this.effect == 'replace' ? this.biteChar : '';
      for (var x = 0; x <= this.numChar; x++) {
        setTimeout(function () {
          if (_this.effect === 'add') {
            _this.addChar();
          } else if (_this.effect === 'replace') {
            _this.replaceChar();
          }
        }, x * duration);
      }
    }
    _createClass(GlitchText, [{
      key: "replaceChar",
      value: function replaceChar() {
        var middleStringPart;
        if (this.curChar + 1 < this.numChar) {
          middleStringPart = chars[Math.floor(Math.random() * chars.length)];
        } else {
          middleStringPart = '';
        }
        var firstStringPart = this.trueText.substr(0, this.curChar);
        var lastStringPart = this.biteChar.substr(this.curChar, this.numChar);
        this.element.innerHTML = firstStringPart + middleStringPart + lastStringPart;
        this.element.dataset.text = firstStringPart + middleStringPart + lastStringPart;
        this.curChar++;
      }
    }, {
      key: "addChar",
      value: function addChar() {
        var middleStringPart;
        if (this.curChar + 1 < this.numChar) {
          middleStringPart = chars[Math.floor(Math.random() * chars.length)];
        } else {
          middleStringPart = '';
        }
        var firstStringPart = this.trueText.substr(0, this.curChar);
        this.element.innerHTML = firstStringPart + middleStringPart;
        this.element.dataset.text = firstStringPart + middleStringPart;
        this.curChar++;
      }
    }]);
    return GlitchText;
  }();

  var handleAction = function handleAction() {
    window['openOffFrame'] = function () {
      document.body.classList.toggle('openedOffWindow');
      var titleElem = document.getElementById('projectTitle');
      new GlitchText({
        element: titleElem,
        effect: 'add'
      });
    };
    var buttons = document.querySelectorAll('[data-action]');
    if (typeof buttons != 'undefined') {
      var _loop = function _loop() {
        var action = buttons[b].getAttribute('data-action');
        buttons[b].addEventListener('click', function () {
          var calledFunction = window[action];
          if (typeof calledFunction !== 'function') {
            console.log(action, ' is not defined');
          } else {
            calledFunction();
          }
        }, false);
      };
      for (var b = 0; b < buttons.length; b++) {
        _loop();
      }
    }
  };

  var windowFrame = document.getElementById('windowFrame');
  var loader = document.getElementById('loading');
  new p5(squircle, windowFrame);
  windowFrame.removeChild(loader);
  window.init = squircle.init;
  window.export_GIF = squircle.export_GIF;
  window.infobox = infobox;
  handleAction();

})(p5.createLoop, p5);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9za2V0Y2gtY29tbW9uL2Vhc2UuanMiLCIuLi8uLi8uLi9za2V0Y2gtY29tbW9uL3BhcmFtLXNsaWRlci5qcyIsIi4uLy4uLy4uL3NrZXRjaC1jb21tb24vZ2VuZXJhdGVIc2xhQ29sb3JzLmpzIiwiLi4vLi4vLi4vc2tldGNoL3NxdWlyY2xlL3NxdWlyY2xlLmpzIiwiLi4vLi4vLi4vc2tldGNoLWNvbW1vbi9pbmZvYm94LmpzIiwiLi4vLi4vLi4vc2tldGNoLWNvbW1vbi9nbGl0Y2hUZXh0LmpzIiwiLi4vLi4vLi4vc2tldGNoLWNvbW1vbi9oYW5kbGUtYWN0aW9uLmpzIiwiLi4vLi4vLi4vc2tldGNoL3NxdWlyY2xlL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRWFzZSBmdW5jdGlvbiBhZGFwdGVkIGZyb20gcHJvY2Vzc2luZ1xuICogQHBhcmFtIHtmbG9hdH0gcCB0aGUgdmFyIChiZXR3ZWVuIDAgJiAxKSB0byBlYXNlXG4gKiBAYXV0aG9yIGJlZXNhbmRib21icyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9iZWVzYW5kYm9tYnNcbiAqL1xuXG5jb25zdCBlYXNlID0gKHAsIGcgPSBmYWxzZSkgPT4ge1xuICAgIGlmIChnKSB7XG4gICAgICAgIHJldHVybiBwIDwgMC41XG4gICAgICAgICAgICA/IDAuNSAqIE1hdGgucG93KDIgKiBwLCBnKVxuICAgICAgICAgICAgOiAxIC0gMC41ICogTWF0aC5wb3coMiAqICgxIC0gcCksIGcpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIDMgKiBwICogcCAtIDIgKiBwICogcCAqIHBcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBlYXNlXG4iLCIvKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIHNsaWRlciB0byBjaGFuZ2UgYSBza2V0Y2ggcGFyYW1ldGVyXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHBhcmFtIGluaXRpYWxpemF0aW9uIG9iamVjdFxuICogcGFyYW10ZXIgbmFtZSA6IHtcbiAqICAgICAgdmFsdWU6IGluaXQgcGFyYW1ldGVyIHZhbHVlLFxuICogICAgICBvcHRpb25zIDoge1xuICogICAgICAgICBtaW46IG1pbmltdW0gcGFyYW1ldGVyIHZhbHVlLFxuICogICAgICAgICBtYXg6IG1heGltdW0gdmFsdWUsXG4gKiAgICAgICAgIHN0ZXA6IHN0ZXAgdG8gaW5jcmVtZW50IHZhbHVlICBcbiAqICAgICAgICAgbGFiZWw6IGV4cGxpY2l0IG5hbWUgb3IgZmFsc2VcbiAqICAgICAgfSxcbiAqICAgICAgY2FsbGJhY2s6IGEgZnVuY3Rpb24gdG8gY2FsbCBvbiBjaGFuZ2VcbiAqIH1cbiAqIElmIHlvdSB3YW50IHRvIGNhbGwgYSBmdW5jdGlvbiBhZnRlciBwYXJhbSBjaGFuZ2UsXG4gKiB5b3UgaGF2ZSB0byBzZXQgYSBza2V0Y2guaW5pdCBmdW5jdGlvblxuICovXG5jb25zdCBwYXJhbVNsaWRlciA9IChwYXJhbSwgcGFyYW1OYW1lID0gZmFsc2UpID0+IHtcbiAgICBsZXQgbGFiZWwgPSAnJ1xuICAgIGlmIChwYXJhbS5vcHRpb25zLmxhYmVsKSB7XG4gICAgICAgIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKVxuICAgICAgICBsYWJlbC5pbm5lckhUTUwgPSBwYXJhbS5vcHRpb25zLmxhYmVsXG4gICAgfVxuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JylcbiAgICBzbGlkZXIudHlwZSA9ICdyYW5nZSdcbiAgICBzbGlkZXIubWluID0gcGFyYW0ub3B0aW9ucy5taW5cbiAgICBzbGlkZXIubWF4ID0gcGFyYW0ub3B0aW9ucy5tYXhcbiAgICBzbGlkZXIuc3RlcCA9IHBhcmFtLm9wdGlvbnMuc3RlcFxuICAgIHNsaWRlci52YWx1ZSA9IHBhcmFtLnZhbHVlXG4gICAgaWYgKHBhcmFtTmFtZSkge1xuICAgICAgICBzbGlkZXIubmFtZSA9IHBhcmFtTmFtZVxuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JylcbiAgICB2YWx1ZS50eXBlID0gJ3RleHQnXG4gICAgdmFsdWUudmFsdWUgPSBwYXJhbS52YWx1ZVxuXG4gICAgaWYgKHBhcmFtLmNhbGxCYWNrICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgcGFyYW0udmFsdWUgPSBOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgICAgdmFsdWUudmFsdWUgPSBldmVudC50YXJnZXQudmFsdWVcbiAgICAgICAgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwYXJhbS52YWx1ZSlcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICBpZiAoIHBhcmFtLmNhbGxCYWNrICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHBhcmFtLmNhbGxCYWNrKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICovXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBbbGFiZWwsIHNsaWRlciwgdmFsdWVdXG59XG5cbmV4cG9ydCBkZWZhdWx0IHBhcmFtU2xpZGVyXG4iLCIvKipcbiAqIEdlbmVyYXRlIG11bHRpcGxlIGNvbG9yc1xuICpcbiAqIENhdXRpb246IHRvIHVzZSBpbiBwNSB5b3UgaGF2ZSB0byBzZSB0aGUgY29sb3JNb2RlIHRvIEhTTCwgMzYwLCAxMDAsIDEwMCwgMTAwXG4gKlxuICogQHBhcmFtIHtpbnR9IHNhdHVyYXRpb24gaW4gcGVyY2VudCB0aGUgc2F0dXJhdGlvbiBvZiB0aGUgcmV0dXJuZWQgY29sb3JzXG4gKiBAcGFyYW0ge2ludH0gbGlnaHRuZXNzIGluIHBlcmNlbnQgdGhlIGJyaWdodG5lc3MgdmFsdWUgb2YgZ2VuZXJhdGVkIGNvbG9yc1xuICogQHBhcmFtIHtpbnR9IGFscGhhIGluIHBlcmNlbnQgdGhlIGFscGhhIHZhbHVlIG9mIHJldHVybmVkIGNvbG9yc1xuICogQHBhcmFtIHtpbnR9IGFtb3VudCBob3cgbWFueSBjb2xvciB5b3Ugd2FudFxuICovXG5jb25zdCBnZW5lcmF0ZUhzbGFDb2xvcnMgPSAoXG4gICAgc2F0dXJhdGlvbiA9IDc1LFxuICAgIGxpZ2h0bmVzcyA9IDc1LFxuICAgIGFscGhhID0gMTAwLFxuICAgIGFtb3VudFxuKSA9PiB7XG4gICAgY29uc3QgY29sb3JzID0gW11cbiAgICBjb25zdCBodWVCZWdpbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MClcbiAgICBjb25zdCBodWVEZWx0YSA9IE1hdGgudHJ1bmMoMzYwIC8gYW1vdW50KVxuICAgIGxldCBodWUgPSBodWVCZWdpblxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbW91bnQ7IGkrKykge1xuICAgICAgICBodWUgKz0gaHVlRGVsdGFcbiAgICAgICAgaHVlID0gaHVlID4gMzYwID8gaHVlICUgMzYwIDogaHVlXG4gICAgICAgIGNvbG9ycy5wdXNoKFtodWUsIHNhdHVyYXRpb24sIGxpZ2h0bmVzcywgYWxwaGFdKVxuICAgIH1cblxuICAgIHJldHVybiBjb2xvcnNcbn1cblxuZXhwb3J0IHsgZ2VuZXJhdGVIc2xhQ29sb3JzIH1cbiIsImltcG9ydCBlYXNlIGZyb20gJy4uLy4uL3NrZXRjaC1jb21tb24vZWFzZSdcbmltcG9ydCBwYXJhbVNsaWRlciBmcm9tICcuLi8uLi9za2V0Y2gtY29tbW9uL3BhcmFtLXNsaWRlcidcbmltcG9ydCB7IGdlbmVyYXRlSHNsYUNvbG9ycyB9IGZyb20gJy4uLy4uL3NrZXRjaC1jb21tb24vZ2VuZXJhdGVIc2xhQ29sb3JzJ1xuXG5sZXQgcmFkaXVzXG5sZXQgY29sb3JzLCBpc1JlY29yZGluZ1xuY29uc3QgZnJhbWVzUGVyU2Vjb25kID0gMjRcbmNvbnN0IG51bUZyYW1lID0gNjBcbmNvbnN0IHNrZXRjaFNpemUgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2lkZSA9IE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdzogc2lkZSA+IDgwMCA/IDgwMCA6IHNpZGUgKiAwLjg1LFxuICAgICAgICBoOiBzaWRlID4gODAwID8gODAwIDogc2lkZSAqIDAuODVcbiAgICB9XG59XG5cbmNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKVxuaXNSZWNvcmRpbmcgPSB1cmxQYXJhbXMuZ2V0KCdyZXNvbHV0aW9uJykgJiYgdXJsUGFyYW1zLmdldCgndHJhbnNpdGlvbicpXG5cbmNvbnN0IHBhcmFtcyA9IHtcbiAgICB0cmFuc2l0aW9uOiB7XG4gICAgICAgIHZhbHVlOiB1cmxQYXJhbXMuZ2V0KCd0cmFuc2l0aW9uJykgfHwgNSxcbiAgICAgICAgb3B0aW9uczogeyBtaW46IDEsIG1heDogMTUsIHN0ZXA6IDAuMSwgbGFiZWw6ICdNb3JwaGluZyBzbW9vdGhpbmcnIH0sXG4gICAgfSxcbiAgICByZXNvbHV0aW9uOiB7XG4gICAgICAgIHZhbHVlOiB1cmxQYXJhbXMuZ2V0KCdyZXNvbHV0aW9uJykgfHwgMC41LFxuICAgICAgICBvcHRpb25zOiB7IG1pbjogMC4xLCBtYXg6IDAuNSwgc3RlcDogMC4xLCBsYWJlbDogJ1Jlc29sdXRpb24nIH0sXG4gICAgfVxufVxuY29uc3QgZ2lmT3B0aW9ucyA9IHtcbiAgICBxdWFsaXR5OiAxMCxcbiAgICByZW5kZXI6IGZhbHNlLFxuICAgIGRvd25sb2FkOiB0cnVlLFxuICAgIGZpbGVOYW1lOiAnc3F1aXJjbGUuZ2lmJ1xufVxuY29uc3Qgd2luZG93RnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2luZG93RnJhbWUnKVxuY29uc3Qgc3F1aXJjbGUgPSAocDUpID0+IHtcbiAgICBwNS5zZXR1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgY2FudmFzU2l6ZSA9IHNrZXRjaFNpemUoKVxuICAgICAgICBwNS5jcmVhdGVDYW52YXMoY2FudmFzU2l6ZS53LCBjYW52YXNTaXplLmgpXG4gICAgICAgIHA1LmZyYW1lUmF0ZShmcmFtZXNQZXJTZWNvbmQpXG4gICAgICAgIHA1LmNvbG9yTW9kZShwNS5IU0wsIDM2MCwgMTAwLCAxMDAsIDEwMClcblxuICAgICAgICBpZiAoaXNSZWNvcmRpbmcpIHtcbiAgICAgICAgICAgIHA1LmNyZWF0ZUxvb3Aoe1xuICAgICAgICAgICAgICAgIGdpZjogeyAuLi5naWZPcHRpb25zIH0sXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IG51bUZyYW1lIC8gZnJhbWVzUGVyU2Vjb25kLFxuICAgICAgICAgICAgICAgIGZyYW1lc1BlclNlY29uZDogZnJhbWVzUGVyU2Vjb25kXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHJhZGl1cyA9IE1hdGgubWluKHA1LndpZHRoLCBwNS5oZWlnaHQpIC8gOFxuICAgICAgICBjb25zdCBwYXJhbUJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIHBhcmFtQm94LmlkID0gJ2ludGVyYWN0aXZlUGFyYW1ldGVyJ1xuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICBjb25zdCBlbGVtcyA9IHBhcmFtU2xpZGVyKHsuLi5wYXJhbXNbaV0sIGNhbGxiYWNrOiB3aW5kb3cuaW5pdH0sIGkpXG4gICAgICAgICAgICBlbGVtcy5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgcGFyYW1Cb3guYXBwZW5kQ2hpbGQoZWxlbSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZXhwb3J0QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKVxuICAgICAgICBleHBvcnRCdXR0b24udHlwZSA9ICdzdWJtaXQnXG4gICAgICAgIGV4cG9ydEJ1dHRvbi52YWx1ZSA9IGlzUmVjb3JkaW5nXG4gICAgICAgICAgICA/ICdHSUYgaXMgcHJvY2Vzc2luZydcbiAgICAgICAgICAgIDogJ0Rvd25sb2FkIGFzIGEgR0lGJ1xuICAgICAgICBwYXJhbUJveC5hcHBlbmRDaGlsZChleHBvcnRCdXR0b24pXG4gICAgICAgIHdpbmRvd0ZyYW1lLmFwcGVuZENoaWxkKHBhcmFtQm94KVxuICAgICAgICBzcXVpcmNsZS5pbml0KClcblxuICAgICAgICBwNS5ub0ZpbGwoKVxuICAgIH1cbiAgICBwNS5kcmF3ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBwNS5iYWNrZ3JvdW5kKDApXG4gICAgICAgIGNvbnN0IHQgPSAocDUuZnJhbWVDb3VudCAlIG51bUZyYW1lKSAvIG51bUZyYW1lXG4gICAgICAgIGNvbnN0IHR0ID0gdCA8PSAwLjUgPyB0ICsgdCA6IDIgLSAodCArIHQpXG4gICAgICAgIGNvbnN0IHJvdCA9IDIgKiBNYXRoLlBJICogZWFzZSgxIC0gdCAqIHQsIHBhcmFtc1sndHJhbnNpdGlvbiddLnZhbHVlKVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTsgaSArPSBwYXJhbXNbJ3Jlc29sdXRpb24nXS52YWx1ZSAvIDQpIHtcbiAgICAgICAgICAgIGNvbnN0IHRoZXRhMSA9IE1hdGguUEkgKiAyICogaVxuICAgICAgICAgICAgY29uc3QgclIgPVxuICAgICAgICAgICAgICAgIHJhZGl1cyAqXG4gICAgICAgICAgICAgICAgTWF0aC5taW4oXG4gICAgICAgICAgICAgICAgICAgIDEgLyBNYXRoLmFicyhNYXRoLmNvcyh0aGV0YTEpKSxcbiAgICAgICAgICAgICAgICAgICAgMSAvIE1hdGguYWJzKE1hdGguc2luKHRoZXRhMSkpXG4gICAgICAgICAgICAgICAgKVxuXG4gICAgICAgICAgICBjb25zdCByID0gcDUubGVycChyYWRpdXMsIHJSLCBlYXNlKHR0LCBwYXJhbXNbJ3RyYW5zaXRpb24nXS52YWx1ZSkpXG5cbiAgICAgICAgICAgIGNvbnN0IHggPSBwNS53aWR0aCAvIDIgKyByICogTWF0aC5jb3ModGhldGExICsgcm90KVxuICAgICAgICAgICAgY29uc3QgeSA9IHA1LmhlaWdodCAvIDIgKyByICogTWF0aC5zaW4odGhldGExICsgcm90KVxuXG4gICAgICAgICAgICBjb25zdCBjb2xvckluZGV4ID0gTWF0aC5yb3VuZCgoMSAvIHBhcmFtc1sncmVzb2x1dGlvbiddLnZhbHVlKSAqIGkpXG4gICAgICAgICAgICBwNS5zdHJva2UoY29sb3JzW2NvbG9ySW5kZXggJSBjb2xvcnMubGVuZ3RoXSlcbiAgICAgICAgICAgIHA1LmZpbGwoY29sb3JzW2NvbG9ySW5kZXggJSBjb2xvcnMubGVuZ3RoXSlcbiAgICAgICAgICAgIHA1LmJlZ2luU2hhcGUoKVxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxOyBqICs9IHBhcmFtc1sncmVzb2x1dGlvbiddLnZhbHVlIC8gNCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRoZXRhMiA9IE1hdGguUEkgKiAyICogalxuICAgICAgICAgICAgICAgIGNvbnN0IF9yUiA9IHJhZGl1c1xuICAgICAgICAgICAgICAgIE1hdGgubWluKFxuICAgICAgICAgICAgICAgICAgICAxIC8gTWF0aC5hYnMoTWF0aC5jb3ModGhldGEyKSksXG4gICAgICAgICAgICAgICAgICAgIDEgLyBNYXRoLmFicyhNYXRoLnNpbih0aGV0YTIpKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBjb25zdCBfciA9IHA1LmxlcnAocmFkaXVzLCBfclIgLyAyLCBlYXNlKHR0KSlcbiAgICAgICAgICAgICAgICBjb25zdCBfeCA9IHggKyBfciAqIE1hdGguY29zKHRoZXRhMiArIHJvdClcbiAgICAgICAgICAgICAgICBjb25zdCBfeSA9IHkgKyBfciAqIE1hdGguc2luKHRoZXRhMiArIHJvdClcblxuICAgICAgICAgICAgICAgIHA1LnZlcnRleChfeCwgX3kpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwNS5lbmRTaGFwZShwNS5DTE9TRSlcbiAgICAgICAgfVxuICAgIH1cbiAgICBzcXVpcmNsZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb2xvcnMgPSBnZW5lcmF0ZUhzbGFDb2xvcnMoXG4gICAgICAgICAgICA4MCxcbiAgICAgICAgICAgIDYwLFxuICAgICAgICAgICAgNTAsXG4gICAgICAgICAgICBNYXRoLnJvdW5kKDEgLyBwYXJhbXNbJ3Jlc29sdXRpb24nXS52YWx1ZSlcbiAgICAgICAgKS5tYXAoKGMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwNS5jb2xvcihjWzBdLCBjWzFdLCBjWzJdLCBjWzNdKVxuICAgICAgICB9KVxuICAgICAgICBwNS5zdHJva2VXZWlnaHQocDUubWFwKHBhcmFtc1sncmVzb2x1dGlvbiddLnZhbHVlLCAwLjEsIDAuNSwgMS41LCAzKSlcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNxdWlyY2xlXG4iLCJjb25zdCBpbmZvYm94ID0gKCkgPT4ge1xuXG4gICAgY29uc3QgaW5mb0JveEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5mb2JveCcpO1xuXG4gICAgaWYgKGluZm9Cb3hFbGVtZW50ICE9IG51bGwpIHtcbiAgICAgICAgaW5mb0JveEVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJylcbiAgICB9XG5cbn1cbmV4cG9ydCBkZWZhdWx0IGluZm9ib3giLCJjb25zdCBjaGFycyA9IFsuLi4nMDEyMzQ1Njc4OScsIC4uLic6Lyp8JiNAJCE8PicsIC4uLid7fVtdKy1fXn4lPzsoKSddXG5jb25zdCBkdXJhdGlvbiA9IDQ1XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdsaXRjaFRleHQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BlcnR5KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IHByb3BlcnR5LmVsZW1lbnRcbiAgICAgICAgdGhpcy50cnVlVGV4dCA9IHByb3BlcnR5LmVsZW1lbnQuaW5uZXJUZXh0IHx8IHByb3BlcnR5LmVsZW1lbnQuaW5uZXJIVE1MXG4gICAgICAgIHRoaXMubnVtQ2hhciA9IHRoaXMudHJ1ZVRleHQubGVuZ3RoXG4gICAgICAgIHRoaXMuZWZmZWN0ID0gcHJvcGVydHkuZWZmZWN0XG4gICAgICAgIHRoaXMuY3VyQ2hhciA9IDBcbiAgICAgICAgdGhpcy5iaXRlQ2hhciA9ICcnXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm51bUNoYXI7IGkrKykge1xuICAgICAgICAgICAgbGV0IGNoYXJBdEkgPSB0aGlzLnRydWVUZXh0LnN1YnN0cihpLCAxKVxuICAgICAgICAgICAgaWYgKGNoYXJBdEkgJiYgY2hhckF0SSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaXRlQ2hhciArPSAnICdcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaXRlQ2hhciArPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSB0aGlzLmVmZmVjdCA9PSAncmVwbGFjZScgPyB0aGlzLmJpdGVDaGFyIDogJydcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPD0gdGhpcy5udW1DaGFyOyB4KyspIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVmZmVjdCA9PT0gJ2FkZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDaGFyKClcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZWZmZWN0ID09PSAncmVwbGFjZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXBsYWNlQ2hhcigpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgeCAqIGR1cmF0aW9uKVxuICAgICAgICB9XG4gICAgfVxuICAgIHJlcGxhY2VDaGFyKCkge1xuICAgICAgICBsZXQgbWlkZGxlU3RyaW5nUGFydFxuICAgICAgICBpZiAodGhpcy5jdXJDaGFyICsgMSA8IHRoaXMubnVtQ2hhcikge1xuICAgICAgICAgICAgbWlkZGxlU3RyaW5nUGFydCA9IGNoYXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNoYXJzLmxlbmd0aCldXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtaWRkbGVTdHJpbmdQYXJ0ID0gJydcbiAgICAgICAgfVxuICAgICAgICBsZXQgZmlyc3RTdHJpbmdQYXJ0ID0gdGhpcy50cnVlVGV4dC5zdWJzdHIoMCwgdGhpcy5jdXJDaGFyKVxuICAgICAgICBsZXQgbGFzdFN0cmluZ1BhcnQgPSB0aGlzLmJpdGVDaGFyLnN1YnN0cih0aGlzLmN1ckNoYXIsIHRoaXMubnVtQ2hhcilcbiAgICAgICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9XG4gICAgICAgICAgICBmaXJzdFN0cmluZ1BhcnQgKyBtaWRkbGVTdHJpbmdQYXJ0ICsgbGFzdFN0cmluZ1BhcnRcbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdGFzZXQudGV4dCA9XG4gICAgICAgICAgICBmaXJzdFN0cmluZ1BhcnQgKyBtaWRkbGVTdHJpbmdQYXJ0ICsgbGFzdFN0cmluZ1BhcnRcbiAgICAgICAgdGhpcy5jdXJDaGFyKytcbiAgICB9XG4gICAgYWRkQ2hhcigpIHtcbiAgICAgICAgbGV0IG1pZGRsZVN0cmluZ1BhcnRcbiAgICAgICAgaWYgKHRoaXMuY3VyQ2hhciArIDEgPCB0aGlzLm51bUNoYXIpIHtcbiAgICAgICAgICAgIG1pZGRsZVN0cmluZ1BhcnQgPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWlkZGxlU3RyaW5nUGFydCA9ICcnXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZmlyc3RTdHJpbmdQYXJ0ID0gdGhpcy50cnVlVGV4dC5zdWJzdHIoMCwgdGhpcy5jdXJDaGFyKVxuICAgICAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gZmlyc3RTdHJpbmdQYXJ0ICsgbWlkZGxlU3RyaW5nUGFydFxuICAgICAgICB0aGlzLmVsZW1lbnQuZGF0YXNldC50ZXh0ID0gZmlyc3RTdHJpbmdQYXJ0ICsgbWlkZGxlU3RyaW5nUGFydFxuICAgICAgICB0aGlzLmN1ckNoYXIrK1xuICAgIH1cbn1cbiIsImltcG9ydCBHbGl0Y2hUZXh0IGZyb20gJy4vZ2xpdGNoVGV4dCdcblxuY29uc3QgaGFuZGxlQWN0aW9uID0gKCkgPT4ge1xuICAgIHdpbmRvd1snb3Blbk9mZkZyYW1lJ10gPSAoKSA9PiB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnb3BlbmVkT2ZmV2luZG93JylcbiAgICAgICAgY29uc3QgdGl0bGVFbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2plY3RUaXRsZScpXG4gICAgICAgIG5ldyBHbGl0Y2hUZXh0KHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IHRpdGxlRWxlbSxcbiAgICAgICAgICAgIGVmZmVjdDogJ2FkZCdcbiAgICAgICAgfSlcbiAgICB9XG4gICAgY29uc3QgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbl0nKVxuXG4gICAgaWYgKHR5cGVvZiBidXR0b25zICE9ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgYnV0dG9ucy5sZW5ndGg7IGIrKykge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uID0gYnV0dG9uc1tiXS5nZXRBdHRyaWJ1dGUoJ2RhdGEtYWN0aW9uJylcbiAgICAgICAgICAgIGJ1dHRvbnNbYl0uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAnY2xpY2snLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2FsbGVkRnVuY3Rpb24gPSB3aW5kb3dbYWN0aW9uXVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxlZEZ1bmN0aW9uICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhY3Rpb24sICcgaXMgbm90IGRlZmluZWQnKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGVkRnVuY3Rpb24oKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBoYW5kbGVBY3Rpb25cbiIsImltcG9ydCAnLi4vZnJhbWVkLWNhbnZhcy5jc3MnXG5pbXBvcnQgJy4uL2ZyYW1lZC10d28tY29sdW1ucy5jc3MnXG5pbXBvcnQgJ3A1LmNyZWF0ZUxvb3AnXG5pbXBvcnQgc3F1aXJjbGUgZnJvbSAnLi9zcXVpcmNsZSdcbmltcG9ydCBpbmZvYm94IGZyb20gJy4uLy4uL3NrZXRjaC1jb21tb24vaW5mb2JveCdcbmltcG9ydCBoYW5kbGVBY3Rpb24gZnJvbSAnLi4vLi4vc2tldGNoLWNvbW1vbi9oYW5kbGUtYWN0aW9uJ1xuaW1wb3J0IHA1IGZyb20gJ3A1J1xuXG5jb25zdCB3aW5kb3dGcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3aW5kb3dGcmFtZScpXG5jb25zdCBsb2FkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGluZycpXG5cbm5ldyBwNShzcXVpcmNsZSwgd2luZG93RnJhbWUpXG53aW5kb3dGcmFtZS5yZW1vdmVDaGlsZChsb2FkZXIpXG53aW5kb3cuaW5pdCA9IHNxdWlyY2xlLmluaXRcbndpbmRvdy5leHBvcnRfR0lGID0gc3F1aXJjbGUuZXhwb3J0X0dJRlxud2luZG93LmluZm9ib3ggPSBpbmZvYm94XG5oYW5kbGVBY3Rpb24oKVxuIl0sIm5hbWVzIjpbImVhc2UiLCJwIiwiZyIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIk1hdGgiLCJwb3ciLCJwYXJhbVNsaWRlciIsInBhcmFtIiwicGFyYW1OYW1lIiwibGFiZWwiLCJvcHRpb25zIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaW5uZXJIVE1MIiwic2xpZGVyIiwidHlwZSIsIm1pbiIsIm1heCIsInN0ZXAiLCJ2YWx1ZSIsIm5hbWUiLCJjYWxsQmFjayIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsIk51bWJlciIsInRhcmdldCIsImNvbnNvbGUiLCJsb2ciLCJnZW5lcmF0ZUhzbGFDb2xvcnMiLCJzYXR1cmF0aW9uIiwibGlnaHRuZXNzIiwiYWxwaGEiLCJhbW91bnQiLCJjb2xvcnMiLCJodWVCZWdpbiIsImZsb29yIiwicmFuZG9tIiwiaHVlRGVsdGEiLCJ0cnVuYyIsImh1ZSIsImkiLCJwdXNoIiwicmFkaXVzIiwiaXNSZWNvcmRpbmciLCJmcmFtZXNQZXJTZWNvbmQiLCJudW1GcmFtZSIsInNrZXRjaFNpemUiLCJzaWRlIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwidyIsImgiLCJ1cmxQYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJsb2NhdGlvbiIsInNlYXJjaCIsImdldCIsInBhcmFtcyIsInRyYW5zaXRpb24iLCJyZXNvbHV0aW9uIiwiZ2lmT3B0aW9ucyIsInF1YWxpdHkiLCJyZW5kZXIiLCJkb3dubG9hZCIsImZpbGVOYW1lIiwid2luZG93RnJhbWUiLCJnZXRFbGVtZW50QnlJZCIsInNxdWlyY2xlIiwicDUiLCJzZXR1cCIsImNhbnZhc1NpemUiLCJjcmVhdGVDYW52YXMiLCJmcmFtZVJhdGUiLCJjb2xvck1vZGUiLCJIU0wiLCJjcmVhdGVMb29wIiwiZ2lmIiwiX29iamVjdFNwcmVhZCIsImR1cmF0aW9uIiwid2lkdGgiLCJoZWlnaHQiLCJwYXJhbUJveCIsImlkIiwiZWxlbXMiLCJjYWxsYmFjayIsImluaXQiLCJmb3JFYWNoIiwiZWxlbSIsImFwcGVuZENoaWxkIiwiZXhwb3J0QnV0dG9uIiwibm9GaWxsIiwiZHJhdyIsImJhY2tncm91bmQiLCJ0IiwiZnJhbWVDb3VudCIsInR0Iiwicm90IiwiUEkiLCJ0aGV0YTEiLCJyUiIsImFicyIsImNvcyIsInNpbiIsInIiLCJsZXJwIiwieCIsInkiLCJjb2xvckluZGV4Iiwicm91bmQiLCJzdHJva2UiLCJmaWxsIiwiYmVnaW5TaGFwZSIsImoiLCJ0aGV0YTIiLCJfclIiLCJfciIsIl94IiwiX3kiLCJ2ZXJ0ZXgiLCJlbmRTaGFwZSIsIkNMT1NFIiwibWFwIiwiYyIsImNvbG9yIiwic3Ryb2tlV2VpZ2h0IiwiaW5mb2JveCIsImluZm9Cb3hFbGVtZW50IiwiY2xhc3NMaXN0IiwidG9nZ2xlIiwiY2hhcnMiLCJjb25jYXQiLCJfdG9Db25zdW1hYmxlQXJyYXkiLCJHbGl0Y2hUZXh0IiwicHJvcGVydHkiLCJfdGhpcyIsIl9jbGFzc0NhbGxDaGVjayIsImVsZW1lbnQiLCJ0cnVlVGV4dCIsImlubmVyVGV4dCIsIm51bUNoYXIiLCJlZmZlY3QiLCJjdXJDaGFyIiwiYml0ZUNoYXIiLCJjaGFyQXRJIiwic3Vic3RyIiwic2V0VGltZW91dCIsImFkZENoYXIiLCJyZXBsYWNlQ2hhciIsIl9jcmVhdGVDbGFzcyIsImtleSIsIm1pZGRsZVN0cmluZ1BhcnQiLCJmaXJzdFN0cmluZ1BhcnQiLCJsYXN0U3RyaW5nUGFydCIsImRhdGFzZXQiLCJ0ZXh0IiwiaGFuZGxlQWN0aW9uIiwiYm9keSIsInRpdGxlRWxlbSIsImJ1dHRvbnMiLCJxdWVyeVNlbGVjdG9yQWxsIiwiX2xvb3AiLCJhY3Rpb24iLCJiIiwiZ2V0QXR0cmlidXRlIiwiY2FsbGVkRnVuY3Rpb24iLCJsb2FkZXIiLCJyZW1vdmVDaGlsZCIsImV4cG9ydF9HSUYiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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
