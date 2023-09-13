(function () {
  'use strict';

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
   * svgTracer
   *
   * @class
   * @name SvgTracer
   * @classdesc Utility class to create SVG (optimized for Inkscape)
   * @author Nicolas Lebrun
   * @license MIT
   *
   */
  var SvgTracer = /*#__PURE__*/function () {
    /**
     * Setup tracer
     * @constructs
     * @param {Object} options Tracer options
     * @property {object} parentElem - the HTML dom element where include the SVG
     * @property {(('A3_landscape'|'A3_portrait'|'A3_square'|'A3_topSpiralNotebook'|'A4_landscape'|'A4_portrait'|'P32x24'|'P24x32')|{w: number, h: number})} size - format name listed above or cm {w: width, h: height}
     * @property {number} dpi - resolution 72, 150 or 300
     * @property {string} background - specify color for non white background
     */
    function SvgTracer(options) {
      _classCallCheck(this, SvgTracer);
      this.parentElem = options.parentElem;
      this.dpi = options.dpi === undefined ? 150 : options.dpi;
      this.background = options.background === undefined ? '#ffffff' : options.background;
      this.printFormat = {
        A3_landscape: {
          w: 42,
          h: 29.7
        },
        A3_portrait: {
          w: 29.7,
          h: 42
        },
        A3_square: {
          w: 29.7,
          h: 29.7
        },
        A3_topSpiralNotebook: {
          w: 29.7,
          h: 40.5
        },
        A4_landscape: {
          w: 29.7,
          h: 21
        },
        A4_portrait: {
          w: 21,
          h: 29.7
        },
        P32x24: {
          w: 32,
          h: 24
        },
        P24x32: {
          w: 24,
          h: 32
        }
      };
      this.dpiToPix = {
        72: 30,
        150: 59,
        300: 118
      };
      this.namespace = {
        inkscape: 'http://www.inkscape.org/namespaces/inkscape',
        svg: 'http://www.w3.org/2000/svg'
      };
      this.groups = [];
      if (options.parentElem !== undefined) {
        this.parentElem = options.parentElem;
        if (this.printFormat[options.size] !== undefined || options.size.w !== undefined && options.size.h !== undefined) {
          if (this.dpiToPix[this.dpi] !== undefined) {
            // Custom size
            if (options.size.w && options.size.h) {
              this.width = options.size.w * this.dpiToPix[this.dpi];
              this.height = options.size.h * this.dpiToPix[this.dpi];
              // CM size
              this.size = "".concat(options.size.w, "x").concat(options.size.h);
              this.printSize = options.size;
            }
            // Referenced print formats
            else if (this.printFormat[options.size]) {
              //
              this.width = this.printFormat[options.size].w * this.dpiToPix[this.dpi];
              this.height = this.printFormat[options.size].h * this.dpiToPix[this.dpi];
              // Format name size
              this.size = options.size;
              this.printSize = this.printFormat[options.size];
            }
          } else {
            console.log('DPI is not set to 72, 150 or 300, we cannot initialize <svg>.');
          }
        } else {
          console.log('Wrong format passed, possible options are : ', Object.keys(this.printFormat), ' or custom size object {w: width, h: height}');
        }
      } else {
        console.error("We can't found HTML element where to add the <svg>.");
      }
    }
    /**
     * Create main SVG dom element
     */
    _createClass(SvgTracer, [{
      key: "init",
      value: function init() {
        if (this.parentElem && this.width && this.height) {
          // html and inksape header (tested only on Debian Inkscape 1.0)
          this.elem = document.createElementNS(this.namespace.svg, 'svg');
          this.elem.setAttribute('version', '1.1');
          this.elem.setAttribute('xmlns', this.namespace.svg);
          this.elem.setAttribute('xmlns:svg', this.namespace.svg);
          this.elem.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
          this.elem.setAttribute('xmlns:inkscape', this.namespace.inkscape);
          this.elem.setAttribute('width', "".concat(this.printSize.w, "cm"));
          this.elem.setAttribute('height', "".concat(this.printSize.h, "cm"));
          this.elem.setAttribute('viewBox', "0 0 ".concat(this.width, " ").concat(this.height));
          this.elem.setAttribute('background', this.background);
          this.elem.setAttribute('style', "background: ".concat(this.background, "; box-shadow: 0 0.5em 1em rgba(0,0,0,0.1);"));
          this.elem.style.aspectRatio = "".concat(this.width, " / ").concat(this.height);

          // create an array of group instance (key = group(props.name))
          this.groups = [];
          this.parentElem.appendChild(this.elem);
          this.rect({
            x: 0,
            y: 0,
            w: this.width,
            h: this.height,
            fill: this.background
          });
        }
      }
      /**
       * Remove every element in the SVG dom element
       */
    }, {
      key: "clear",
      value: function clear() {
        while (this.elem.firstChild) {
          this.elem.removeChild(this.elem.firstChild);
        }
        this.groups = [];
      }
      /**
       * Remove everything in groups (dom) elements
       * @param {(string[]|boolean)} groups - (optional) array of specific groups to clear or false (clear all groups)
       */
    }, {
      key: "clearGroups",
      value: function clearGroups() {
        var groups = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        for (var group_name in this.groups) {
          if (!groups || groups.includes(group_name)) {
            while (this.groups[group_name].firstChild) {
              this.groups[group_name].removeChild(this.groups[group_name].firstChild);
            }
          }
        }
      }
      /**
       * Add elem to svg group
       * @param {string} group - the group name
       * @param {object} svgItem - the node element (path, circle...) to append
       */
    }, {
      key: "appendToGroup",
      value: function appendToGroup(group, svgItem) {
        if (this.groups !== undefined || this.groups[group] !== undefined) {
          if (svgItem !== undefined) {
            this.groups[group].appendChild(svgItem);
          } else {
            console.error("The SVG element is not set, and can't be added to group");
          }
        } else {
          console.error("Group ".concat(group, " doesn't exist."));
        }
      }
      /**
       * Drawing a rect
       *
       * @param {Object} rectProps rectangle properties
       * @property {number} x - top left x coordinate of the rectangle
       * @property {number} y - top left y coordinate of the rectangle
       * @property {number} w - width of the rectangle
       * @property {number} h - height of the rectangle
       * @property {string} fill - background color name or color value (HEX, RGB, HSL)
       * @property {string} stroke - border color name or color value (HEX, RGB, HSL)
       * @property {string} group - group name if you want to add rect to a specific group
       */
    }, {
      key: "rect",
      value: function rect(rectProps) {
        rectProps.x = rectProps.x === undefined ? 0 : rectProps.x;
        rectProps.y = rectProps.y === undefined ? 0 : rectProps.y;
        rectProps.w = rectProps.w === undefined ? 0 : rectProps.w;
        rectProps.h = rectProps.h === undefined ? 0 : rectProps.h;
        rectProps.fill = rectProps.fill === undefined ? false : rectProps.fill;
        rectProps.stroke = rectProps.stroke === undefined ? false : rectProps.stroke;
        rectProps.group = rectProps.group === undefined ? false : rectProps.group;
        var rect = document.createElementNS(this.namespace.svg, 'rect');
        rect.setAttribute('x', rectProps.x);
        rect.setAttribute('y', rectProps.y);
        rect.setAttribute('width', rectProps.w);
        rect.setAttribute('height', rectProps.h);
        if (rectProps.fill) { rect.setAttribute('fill', rectProps.fill); }
        if (rectProps.stroke) { rect.setAttribute('stroke', rectProps.stroke); }
        if (rectProps.group) {
          this.appendToGroup(rectProps.group, rect);
        } else {
          this.elem.appendChild(rect);
        }
      }
      /**
       * Draw a circle
       * @param {Object} circleProps circle properties
       * @property {number} x - x coordinate of the circle center
       * @property {number} y - y coordinate of the circle center
       * @property {number} r - radius of the circle
       * @property {string} fill - background color name or color value (HEX, RGB, HSL)
       * @property {string} stroke - border color name or color value (HEX, RGB, HSL)
       * @property {string} group - group name if you want to add rect to a specific group
       */
    }, {
      key: "circle",
      value: function circle(circleProps) {
        circleProps.x = circleProps.x === undefined ? 0 : circleProps.x;
        circleProps.y = circleProps.y === undefined ? 0 : circleProps.y;
        circleProps.r = circleProps.r === undefined ? 0 : circleProps.r;
        circleProps.fill = circleProps.fill === undefined ? false : circleProps.fill;
        circleProps.stroke = circleProps.stroke === undefined ? false : circleProps.stroke;
        circleProps.group = circleProps.group === undefined ? false : circleProps.group;
        var circle = document.createElementNS(this.namespace.svg, 'circle');
        circle.setAttribute('cx', circleProps.x);
        circle.setAttribute('cy', circleProps.y);
        circle.setAttribute('r', circleProps.r);
        if (circleProps.fill) { circle.setAttribute('fill', circleProps.fill); }
        if (circleProps.stroke) { circle.setAttribute('stroke', circleProps.stroke); }
        if (circleProps.group) {
          this.appendToGroup(circleProps.group, circle);
        } else {
          this.elem.appendChild(circle);
        }
      }
      /**
       * Draw triangle
       * @param {Object} triangleProps triangle properties
       * @property {array} points - two dimensional array (points[n] = [x coordinate, y coordinate])
       * @property {string} fill - background color name or color value (HEX, RGB, HSL)
       * @property {string} stroke - border color name or color value (HEX, RGB, HSL)
       * @property {boolean} close - determine if path is closed or open
       * @property {string} name - a name attribute
       * @property {string} group - group name if you want to add path to a specific group
       */
    }, {
      key: "triangle",
      value: function triangle(triangleProps) {
        if (triangleProps.points === undefined) {
          console.error('You must specify 3 points in property object to draw a triangle');
          return;
        } else {
          if (triangleProps.points.length < 3) {
            console.error("It seems that triangleProps.points doesn't have three points.");
            return;
          }
          if (triangleProps.points.length > 3) {
            console.error('Props.point contains more than 3 coordinates, triangle will only use the three first ones.');
          }
        }
        triangleProps.fill = triangleProps.fill === undefined ? false : triangleProps.fill;
        triangleProps.stroke = triangleProps.stroke === undefined ? false : triangleProps.stroke;
        triangleProps.close = triangleProps.close === undefined ? false : triangleProps.close;
        triangleProps.name = triangleProps.name === undefined ? false : triangleProps.name;
        triangleProps.group = triangleProps.group === undefined ? false : triangleProps.group;
        var triangle = document.createElementNS(this.namespace.svg, 'path');
        triangle.setAttribute('d', 'M ' + triangleProps.points[0][0] + ',' + triangleProps.points[0][1] + 'L ' + triangleProps.points[1][0] + ',' + triangleProps.points[1][1] + 'L ' + triangleProps.points[2][0] + ',' + triangleProps.points[2][1] + 'Z');
        if (triangleProps.fill) { triangle.setAttribute('fill', triangleProps.fill); }
        if (triangleProps.stroke) { triangle.setAttribute('stroke', triangleProps.stroke); }
        if (triangleProps.name) { triangle.setAttribute('name', triangleProps.name); }
        if (triangleProps.group) {
          this.appendToGroup(triangleProps.group, triangle);
        } else {
          this.elem.appendChild(triangle);
        }
      }
      /**
       * Draw line
       * @param {Object} pathProps path properties
       * @property {array} points - two dimensional array (points[n] = [x coordinate, y coordinate])
       * @property {string} fill - background color name or color value (HEX, RGB, HSL)
       * @property {string} stroke - border color name or color value (HEX, RGB, HSL)
       * @property {number} strokeWidth - border width in pixels positive int only
       * @property {boolean} close - determine if path is closed or open
       * @property {string} name - a name attribute
       * @property {string} group - group name if you want to add path to a specific group
       */
    }, {
      key: "path",
      value: function path(pathProps) {
        if (pathProps.points === undefined) {
          console.error('You must specify points coordinates to draw a line');
          return;
        }
        pathProps.fill = pathProps.fill === undefined ? false : pathProps.fill;
        pathProps.stroke = pathProps.stroke === undefined ? false : pathProps.stroke;
        pathProps.strokeWidth = pathProps.strokeWidth === undefined || Number(pathProps.setAttr) > 1 ? false : pathProps.strokeWidth;
        pathProps.close = pathProps.close === undefined ? false : pathProps.close;
        pathProps.name = pathProps.name === undefined ? false : pathProps.name;
        pathProps.group = pathProps.group === undefined ? false : pathProps.group;
        var path = document.createElementNS(this.namespace.svg, 'path');
        var points = pathProps.points; //.filter(pt => pt[0] !== undefined && pt[1] !== undefined)

        var d = '';
        if (points[0][0] !== undefined && points[0][1] !== undefined) {
          d += "M ".concat(points[0][0], " ").concat(points[0][1]);
          for (var i = 1; i < points.length; i++) {
            if (points[i][0] !== undefined && points[i][1] !== undefined) {
              d += " L".concat(points[i][0], " ").concat(points[i][1]);
            }
          }
        }
        if (pathProps.close && points[0][0] !== undefined && points[0][1] !== undefined) {
          d += " L".concat(points[0][0], " ").concat(points[0][1]);
        }
        path.setAttribute('d', d);
        if (pathProps.fill) { path.setAttribute('fill', pathProps.fill); }
        if (pathProps.stroke) { path.setAttribute('stroke', pathProps.stroke); }
        if (pathProps.strokeWidth) { path.setAttribute('stroke-width', pathProps.strokeWidth); }
        if (pathProps.name) { path.setAttribute('name', pathProps.name); }
        if (pathProps.group) {
          this.appendToGroup(pathProps.group, path);
        } else {
          this.elem.appendChild(path);
        }
      }
      /**
       * Draw text
       * @param textProps text properties
       * @property {number} x - top left x coordinate text position
       * @property {number} y - top left y coordinate text position
       * @property {string} text - the text to draw
       * @property {string} fontFamily - font family name of the text
       * @property {number} fontSize - font size of the text
       * @property {string} fill - color of text
       * @property {string} anchor - horizontal alignment (start, middle or end)
       * @property {string} name - a name attribute
       * @property {string} group - group name if you want to add path to a specific group
       */
    }, {
      key: "text",
      value: function text(textProps) {
        if (textProps.x === undefined) {
          console.error('You need to specify x property');
          return;
        }
        if (textProps.y === undefined) {
          console.error('You need to specify y property');
          return;
        }
        if (textProps.text === undefined) {
          console.error('You need to specify the text that will be displayed');
          return;
        }
        textProps.fontFamily = textProps.fontFamily === undefined ? 'sans-serif' : textProps.fontFamily;
        textProps.fontSize = textProps.fontSize === undefined ? 16 : textProps.fontSize;
        textProps.fill = textProps.fill === undefined ? 'black' : textProps.fill;
        textProps.anchor = textProps.group === undefined || !['start', 'middle', 'end'].includes(textProps.anchor) ? false : textProps.anchor;
        textProps.name = textProps.name === undefined ? false : textProps.name;
        textProps.group = textProps.group === undefined ? false : textProps.group;
        var text = document.createElementNS(this.namespace.svg, 'text');
        text.setAttribute('x', textProps.x);
        text.setAttribute('y', textProps.y);
        text.setAttribute('font-family', textProps.fontFamily);
        text.setAttribute('font-size', textProps.fontSize);
        text.setAttribute('fill', textProps.fill);
        if (textProps.name) { text.setAttribute('name', textProps.name); }
        if (textProps.anchor) { text.setAttribute('text-anchor', textProps.anchor); }
        text.innerHTML = textProps.text;
        if (textProps.group) {
          this.appendToGroup(textProps.group, text);
        } else {
          this.elem.appendChild(text);
        }
      }
      /**
       * Create group
       * @param {Object} groupProps group properties
       * @property {string} name - an unique group name
       * @property {string} stroke - a stroke color attribute
       * @property {string} strokeWidth - a stroke-width color attribute
       * @property {string} fill - a value of the fill attribute
       * @property {string} group - group name an other group to nest the new one
       * @property {string} id - testing inkscape layer
       */
    }, {
      key: "group",
      value: function group(groupProps) {
        if (groupProps.name === undefined) {
          console.error('You must specified a name because you need it to fill group after created it');
          return;
        }
        groupProps.fill = groupProps.fill === undefined ? false : groupProps.fill;
        groupProps.stroke = groupProps.stroke === undefined ? false : groupProps.stroke;
        groupProps.group = groupProps.group === undefined ? false : groupProps.group;
        groupProps.strokeWidth = groupProps.strokeWidth === undefined ? false : groupProps.strokeWidth;
        groupProps.id = groupProps.id === undefined ? false : 'layer' + groupProps.id;
        var groupElem = document.createElementNS(this.namespace.svg, 'g');
        if (groupProps.name) {
          groupElem.setAttribute('name', groupProps.name);
          groupElem.setAttributeNS(this.namespace.inkscape, 'inkscape:label', groupProps.name);
          groupElem.setAttributeNS(this.namespace.inkscape, 'inkscape:groupmode', 'layer');
        }
        if (groupProps.id) { groupElem.setAttribute('id', groupProps.id); }
        if (groupProps.fill) { groupElem.setAttribute('fill', groupProps.fill); }
        if (groupProps.stroke) { groupElem.setAttribute('stroke', groupProps.stroke); }
        if (groupProps.strokeWidth) { groupElem.setAttribute('stroke-width', groupProps.strokeWidth); }
        if (groupProps.group) {
          this.appendToGroup(groupProps.group, groupElem);
        } else {
          this.elem.appendChild(groupElem);
        }
        this.groups[groupProps.name] = groupElem;
      }
      /**
       * Export SVG dom element as file (groups will appear in Inkcape as layers)
       * @param {Object} exportOptions svf export options
       * @property {string} name - filename prefix (will be suffixed by a timestamp)
       */
    }, {
      key: "export",
      value: function _export(exportOptions) {
        exportOptions.name = exportOptions.name === undefined ? 'untitled' : exportOptions.name;
        var svgFile = null;
        var date = new Date(),
          Y = date.getFullYear(),
          m = date.getMonth(),
          d = date.getDay(),
          H = date.getHours(),
          i = date.getMinutes();
        var filename = "".concat(exportOptions.name, ".").concat(this.size, ".").concat(Y, "-").concat(m, "-").concat(d, "_").concat(H, ".").concat(i, ".svg");
        var svgMarkup = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n                            ".concat(this.elem.outerHTML);
        var data = new Blob([svgMarkup], {
          type: 'application/xml' //'text/plain'
        });

        if (svgFile !== null) {
          window.URL.revokeObjectURL(svgFile);
        }
        svgFile = window.URL.createObjectURL(data);
        var link = document.createElement('a');
        link.href = svgFile;
        link.download = filename;
        link.click();
      }

      /**
       * Convert a centimeter size to pixels from current DPI
       * @param {number} cm cm size to convert
       * @returns {number} px size converted
       */
    }, {
      key: "cmToPixels",
      value: function cmToPixels(cm) {
        if (!isNaN(cm)) {
          return cm * this.dpiToPix[this.dpi];
        } else {
          console.error('The method cmToPixels() must be called with a number in centimeters.');
        }
      }
    }]);
    return SvgTracer;
  }();

  /*
   * A fast javascript implementation of simplex noise by Jonas Wagner

  Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
  Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
  With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
  Better rank ordering method by Stefan Gustavson in 2012.

   Copyright (c) 2022 Jonas Wagner

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
   */

  // 
  var F2 =  0.5 * (Math.sqrt(3.0) - 1.0);
  var G2 =  (3.0 - Math.sqrt(3.0)) / 6.0;
  // I'm really not sure why this | 0 (basically a coercion to int)
  // is making this faster but I get ~5 million ops/sec more on the
  // benchmarks across the board or a ~10% speedup.
  var fastFloor = function (x) { return Math.floor(x) | 0; };
  var grad2 = /*#__PURE__*/ new Float64Array([1, 1,
      -1, 1,
      1, -1,
      -1, -1,
      1, 0,
      -1, 0,
      1, 0,
      -1, 0,
      0, 1,
      0, -1,
      0, 1,
      0, -1]);
  /**
   * Creates a 2D noise function
   * @param random the random function that will be used to build the permutation table
   * @returns {NoiseFunction2D}
   */
  function createNoise2D(random) {
      if ( random === void 0 ) random = Math.random;

      var perm = buildPermutationTable(random);
      // precalculating this yields a little ~3% performance improvement.
      var permGrad2x = new Float64Array(perm).map(function (v) { return grad2[(v % 12) * 2]; });
      var permGrad2y = new Float64Array(perm).map(function (v) { return grad2[(v % 12) * 2 + 1]; });
      return function noise2D(x, y) {
          // if(!isFinite(x) || !isFinite(y)) return 0;
          var n0 = 0; // Noise contributions from the three corners
          var n1 = 0;
          var n2 = 0;
          // Skew the input space to determine which simplex cell we're in
          var s = (x + y) * F2; // Hairy factor for 2D
          var i = fastFloor(x + s);
          var j = fastFloor(y + s);
          var t = (i + j) * G2;
          var X0 = i - t; // Unskew the cell origin back to (x,y) space
          var Y0 = j - t;
          var x0 = x - X0; // The x,y distances from the cell origin
          var y0 = y - Y0;
          // For the 2D case, the simplex shape is an equilateral triangle.
          // Determine which simplex we are in.
          var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
          if (x0 > y0) {
              i1 = 1;
              j1 = 0;
          } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
          else {
              i1 = 0;
              j1 = 1;
          } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
          // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
          // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
          // c = (3-sqrt(3))/6
          var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
          var y1 = y0 - j1 + G2;
          var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
          var y2 = y0 - 1.0 + 2.0 * G2;
          // Work out the hashed gradient indices of the three simplex corners
          var ii = i & 255;
          var jj = j & 255;
          // Calculate the contribution from the three corners
          var t0 = 0.5 - x0 * x0 - y0 * y0;
          if (t0 >= 0) {
              var gi0 = ii + perm[jj];
              var g0x = permGrad2x[gi0];
              var g0y = permGrad2y[gi0];
              t0 *= t0;
              // n0 = t0 * t0 * (grad2[gi0] * x0 + grad2[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
              n0 = t0 * t0 * (g0x * x0 + g0y * y0);
          }
          var t1 = 0.5 - x1 * x1 - y1 * y1;
          if (t1 >= 0) {
              var gi1 = ii + i1 + perm[jj + j1];
              var g1x = permGrad2x[gi1];
              var g1y = permGrad2y[gi1];
              t1 *= t1;
              // n1 = t1 * t1 * (grad2[gi1] * x1 + grad2[gi1 + 1] * y1);
              n1 = t1 * t1 * (g1x * x1 + g1y * y1);
          }
          var t2 = 0.5 - x2 * x2 - y2 * y2;
          if (t2 >= 0) {
              var gi2 = ii + 1 + perm[jj + 1];
              var g2x = permGrad2x[gi2];
              var g2y = permGrad2y[gi2];
              t2 *= t2;
              // n2 = t2 * t2 * (grad2[gi2] * x2 + grad2[gi2 + 1] * y2);
              n2 = t2 * t2 * (g2x * x2 + g2y * y2);
          }
          // Add contributions from each corner to get the final noise value.
          // The result is scaled to return values in the interval [-1,1].
          return 70.0 * (n0 + n1 + n2);
      };
  }
  /**
   * Builds a random permutation table.
   * This is exported only for (internal) testing purposes.
   * Do not rely on this export.
   * @private
   */
  function buildPermutationTable(random) {
      var tableSize = 512;
      var p = new Uint8Array(tableSize);
      for (var i = 0; i < tableSize / 2; i++) {
          p[i] = i;
      }
      for (var i$1 = 0; i$1 < tableSize / 2 - 1; i$1++) {
          var r = i$1 + ~~(random() * (256 - i$1));
          var aux = p[i$1];
          p[i$1] = p[r];
          p[r] = aux;
      }
      for (var i$2 = 256; i$2 < tableSize; i$2++) {
          p[i$2] = p[i$2 - 256];
      }
      return p;
  }

  function areCollinding(p1, p2, p3, p4) {
    var det, gamma, lambda;
    det = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p4[0] - p3[0]) * (p2[1] - p1[1]);
    if (det === 0) {
      return false;
    } else {
      lambda = ((p4[1] - p3[1]) * (p4[0] - p1[0]) + (p3[0] - p4[0]) * (p4[1] - p1[1])) / det;
      gamma = ((p1[1] - p2[1]) * (p4[0] - p1[0]) + (p2[0] - p1[0]) * (p4[1] - p1[1])) / det;
      return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
  }
  function getLineLineCollision(p1, p2, p3, p4) {
    if (!areCollinding(p1, p2, p3, p4)) { return false; }
    var ua = ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) / ((p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]));
    var x = p1[0] + ua * (p2[0] - p1[0]);
    var y = p1[1] + ua * (p2[1] - p1[1]);
    return [x, y];
  }

  /**
   * Determine if point is in poly
   * @param {object} p the [x,y] position of the point
   * @param {array} polygon a list of polygon points
   * @returns {boolean}
   */
  function isPointInsidePolygon (point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    var x = point[0],
      y = point[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0],
        yi = vs[i][1];
      var xj = vs[j][0],
        yj = vs[j][1];
      var intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
      if (intersect) { inside = !inside; }
    }
    return inside;
  }

  /**
   * Create dash along a line
   * @param {Array} line [[x1, y1], [x2, y2]]
   * @param {Number} step maximum dash length
   * @param {Number} mode 0: straight 1: random
   *
   * @returns {Array} of multiple line
   */
  function dashLine (line, step, mode) {
    var angle = Math.atan2(line[1][1] - line[0][1], line[1][0] - line[0][0]);
    var size = Math.sqrt(Math.pow(Math.abs(line[1][0] - line[0][0]), 2) + Math.pow(Math.abs(line[1][1] - line[0][1]), 2));
    var r = 0,
      prev = line[0];
    var dashLine = [];
    while (r < size) {
      // random line length
      var lineLength = step * (mode === 0 ? 0.15 : 0.3 * Math.random());

      // lineLenght too long
      if (r + lineLength > size) { lineLength = size - r; }
      var next = [prev[0] + Math.cos(angle) * lineLength, prev[1] + Math.sin(angle) * lineLength];
      dashLine.push([[prev, next]]);

      // little jump between lines
      var jumpLenght = step * (mode === 0 ? 0.15 : 0.15 * Math.random());
      prev = [].concat(next);
      prev[0] += Math.cos(angle) * jumpLenght;
      prev[1] += Math.sin(angle) * jumpLenght;
      r += jumpLenght + lineLength;
    }
    return dashLine;
  }

  var Part = /*#__PURE__*/_createClass(function Part(points, index) {
    _classCallCheck(this, Part);
    this.points = points;
    this.index = index;
  });

  var margin, parts, tileSize;
  var svg = new SvgTracer({
      parentElem: document.getElementById('windowFrame'),
      size: 'A3_square',
      dpi: 72
    }),
    simplex = createNoise2D(),
    N = Math.ceil(Math.random() * 3),
    I = 48,
    lineStep = 6,
    noiseLine = function noiseLine(line) {
      var noisedLine = [];
      var freq = 0.003;
      var turbulence = 15;
      var force = 2;
      line.forEach(function (pt) {
        var nValue = turbulence * simplex(pt[0] * freq, pt[1] * freq);
        noisedLine.push([pt[0] + Math.cos(nValue) * force, pt[1] + Math.sin(nValue) * force]);
      });
      return noisedLine;
    };
  var sketch = {
    // setup
    launch: function launch() {
      svg.init();
      margin = svg.cmToPixels(3);
      tileSize = [Math.round((svg.width - margin * 2) / N), Math.round((svg.height - margin * 2) / N)];
      sketch.init();
    },
    // reset value and relaunch drawing
    init: function init() {
      svg.clear();
      parts = [];
      for (var x = 0; x < N; x++) {
        for (var y = 0; y < N; y++) {
          parts.push(new Part([[margin + x * tileSize[0], margin + y * tileSize[1]], [margin + (x + 1) * tileSize[0], margin + y * tileSize[1]], [margin + (x + 1) * tileSize[0], margin + (y + 1) * tileSize[1]], [margin + x * tileSize[0], margin + (y + 1) * tileSize[1]]], (x + y) % 2));
        }
      }
      var i = 0;
      while (i < I) {
        sketch.cutTile();
        i++;
      }
      sketch.drawTiles();
    },
    cutTile: function cutTile() {
      var isVertical = Math.random() > 0.5;
      var line = [[isVertical ? Math.round(Math.random() * svg.width) : margin / 2, isVertical ? margin / 2 : Math.round(Math.random() * svg.height)], [isVertical ? Math.round(Math.random() * svg.width) : svg.width - margin / 2, isVertical ? svg.height - margin / 2 : Math.round(Math.random() * svg.height)]];
      var newParts = [];
      var partsToRemove = [];
      parts.forEach(function (part, h) {
        var split = [];
        var intersect = [undefined, undefined];
        part.points.forEach(function (pt, i, points) {
          var nPt = getLineLineCollision(pt, points[i < points.length - 1 ? i + 1 : 0], line[0], line[1]);
          if (nPt) {
            // first collision
            if (undefined == intersect[0]) {
              split.push(nPt);
              intersect[0] = i;

              // second collision
            } else {
              split.push(nPt);
              intersect[1] = i;
            }
          }
        });
        if (split.length >= 2) {
          var a = [],
            b = [];
          part.points.forEach(function (pt, i) {
            if (i <= intersect[0]) { a.push(pt); }
            if (i === intersect[0] + 1) {
              a.push(split[0]);
              b.push(split[0]);
            }
            if (i > intersect[0] && i <= intersect[1]) { b.push(pt); }
            if (i === intersect[1]) {
              b.push(split[1]);
              a.push(split[1]);
            }
            if (i > intersect[1]) {
              a.push(pt);
            }
          });
          newParts.push(new Part(a, part.index + 1));
          newParts.push(new Part(b, part.index + 2));
          partsToRemove.push(h);
        }
      });
      if (undefined !== newParts[0] && undefined !== partsToRemove[0]) {
        var nextParts = parts.filter(function (part, i) {
          return !partsToRemove.includes(i);
        });
        newParts.forEach(function (p) {
          return nextParts.push(p);
        });
        parts = nextParts;
        svg.clear();
        sketch.drawTiles();
      }
    },
    drawTiles: function drawTiles() {
      svg.clear();
      parts.forEach(function (p, i) {
        var min = [Math.min.apply(Math, _toConsumableArray(p.points.map(function (pt) {
          return pt[0];
        }))), Math.min.apply(Math, _toConsumableArray(p.points.map(function (pt) {
          return pt[1];
        })))];
        var max = [Math.max.apply(Math, _toConsumableArray(p.points.map(function (pt) {
          return pt[0];
        }))), Math.max.apply(Math, _toConsumableArray(p.points.map(function (pt) {
          return pt[1];
        })))];
        var size = Math.sqrt(Math.pow(Math.abs(max[0] - min[0]), 2) + Math.pow(Math.abs(max[1] - min[1]), 2));
        var lines = [];
        if (i % 2) {
          for (var x = min[0]; x <= max[0]; x += lineStep) {
            lines.push([[x, min[1]], [x, max[1]]]);
          }
        } else {
          for (var y = min[1]; y <= max[1]; y += lineStep) {
            lines.push([[min[0], y], [max[0], y]]);
          }
        }
        var lineStyle = Math.floor(Math.random() * 6);
        lines.forEach(function (l) {
          var angle = Math.atan2(l[1][1] - l[0][1], l[1][0] - l[0][0]);
          var lastPointInPoly = false;
          var linePoly = [];
          for (var d = 0; d <= size; d++) {
            var pt = [l[0][0] + d * Math.cos(angle), l[0][1] + d * Math.sin(angle)];
            var isPointInPoly = isPointInsidePolygon(pt, p.points);
            if (isPointInPoly !== lastPointInPoly) {
              linePoly.push(pt);
              if (linePoly.length == 2) { break; }
              lastPointInPoly = isPointInPoly;
            }
          }
          if (linePoly.length == 2) {
            switch (lineStyle) {
              // dash noise
              case 0:
                dashLine([_toConsumableArray(linePoly[0]), _toConsumableArray(linePoly[1])], 32, p.index % 2).forEach(function (l) {
                  return svg.path({
                    points: _toConsumableArray(l).map(function (pt) {
                      return noiseLine(pt);
                    }),
                    stroke: 'black',
                    close: false
                  });
                });
                break;
              // full noise
              case 1:
                svg.path({
                  points: noiseLine(linePoly),
                  stroke: 'black',
                  close: false
                });
                break;
              // uniform dash straight
              case 2:
                dashLine([_toConsumableArray(linePoly[0]), _toConsumableArray(linePoly[1])], 32, 0).forEach(function (l) {
                  return svg.path({
                    points: _toConsumableArray(l),
                    stroke: 'black',
                    close: false
                  });
                });
                break;
              // random dash straight
              case 3:
                dashLine([_toConsumableArray(linePoly[0]), _toConsumableArray(linePoly[1])], 32, 1).forEach(function (l) {
                  return svg.path({
                    points: _toConsumableArray(l),
                    stroke: 'black',
                    close: false
                  });
                });
                break;
              // empty
              case 4:
                break;
              // straight line
              case 5:
                svg.path({
                  points: linePoly,
                  stroke: 'black',
                  close: false
                });
                break;
            }
          }
        });
      });
    },
    // export inline <svg> as SVG file
    "export": function _export() {
      svg["export"]({
        name: 'fragmentation'
      });
    }
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

  var containerElement = document.getElementById('windowFrame');
  var loader = document.getElementById('loading');
  sketch.launch();
  containerElement.removeChild(loader);
  window.init = sketch.init;
  window["export"] = sketch["export"];
  window.fold = sketch.cutTile;
  window.infobox = infobox;
  handleAction();

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9za2V0Y2gtY29tbW9uL3N2Zy10cmFjZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc2ltcGxleC1ub2lzZS9kaXN0L2VzbS9zaW1wbGV4LW5vaXNlLmpzIiwiLi4vLi4vLi4vc2tldGNoL2ZyYWdtZW50YXRpb24vdHJpZ29ub21ldHJ5LmpzIiwiLi4vLi4vLi4vc2tldGNoL2ZyYWdtZW50YXRpb24vaXNQb2ludEluc2lkZVBvbHlnb24uanMiLCIuLi8uLi8uLi9za2V0Y2gvZnJhZ21lbnRhdGlvbi9kYXNoTGluZS5qcyIsIi4uLy4uLy4uL3NrZXRjaC9mcmFnbWVudGF0aW9uL1BhcnQuanMiLCIuLi8uLi8uLi9za2V0Y2gvZnJhZ21lbnRhdGlvbi9za2V0Y2guanMiLCIuLi8uLi8uLi9za2V0Y2gtY29tbW9uL2luZm9ib3guanMiLCIuLi8uLi8uLi9za2V0Y2gtY29tbW9uL2dsaXRjaFRleHQuanMiLCIuLi8uLi8uLi9za2V0Y2gtY29tbW9uL2hhbmRsZS1hY3Rpb24uanMiLCIuLi8uLi8uLi9za2V0Y2gvZnJhZ21lbnRhdGlvbi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHN2Z1RyYWNlclxuICpcbiAqIEBjbGFzc1xuICogQG5hbWUgU3ZnVHJhY2VyXG4gKiBAY2xhc3NkZXNjIFV0aWxpdHkgY2xhc3MgdG8gY3JlYXRlIFNWRyAob3B0aW1pemVkIGZvciBJbmtzY2FwZSlcbiAqIEBhdXRob3IgTmljb2xhcyBMZWJydW5cbiAqIEBsaWNlbnNlIE1JVFxuICpcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdmdUcmFjZXIge1xuICAgIC8qKlxuICAgICAqIFNldHVwIHRyYWNlclxuICAgICAqIEBjb25zdHJ1Y3RzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgVHJhY2VyIG9wdGlvbnNcbiAgICAgKiBAcHJvcGVydHkge29iamVjdH0gcGFyZW50RWxlbSAtIHRoZSBIVE1MIGRvbSBlbGVtZW50IHdoZXJlIGluY2x1ZGUgdGhlIFNWR1xuICAgICAqIEBwcm9wZXJ0eSB7KCgnQTNfbGFuZHNjYXBlJ3wnQTNfcG9ydHJhaXQnfCdBM19zcXVhcmUnfCdBM190b3BTcGlyYWxOb3RlYm9vayd8J0E0X2xhbmRzY2FwZSd8J0E0X3BvcnRyYWl0J3wnUDMyeDI0J3wnUDI0eDMyJyl8e3c6IG51bWJlciwgaDogbnVtYmVyfSl9IHNpemUgLSBmb3JtYXQgbmFtZSBsaXN0ZWQgYWJvdmUgb3IgY20ge3c6IHdpZHRoLCBoOiBoZWlnaHR9XG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGRwaSAtIHJlc29sdXRpb24gNzIsIDE1MCBvciAzMDBcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gYmFja2dyb3VuZCAtIHNwZWNpZnkgY29sb3IgZm9yIG5vbiB3aGl0ZSBiYWNrZ3JvdW5kXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICB0aGlzLnBhcmVudEVsZW0gPSBvcHRpb25zLnBhcmVudEVsZW1cbiAgICAgICAgdGhpcy5kcGkgPSBvcHRpb25zLmRwaSA9PT0gdW5kZWZpbmVkID8gMTUwIDogb3B0aW9ucy5kcGlcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID1cbiAgICAgICAgICAgIG9wdGlvbnMuYmFja2dyb3VuZCA9PT0gdW5kZWZpbmVkID8gJyNmZmZmZmYnIDogb3B0aW9ucy5iYWNrZ3JvdW5kXG4gICAgICAgIHRoaXMucHJpbnRGb3JtYXQgPSB7XG4gICAgICAgICAgICBBM19sYW5kc2NhcGU6IHsgdzogNDIsIGg6IDI5LjcgfSxcbiAgICAgICAgICAgIEEzX3BvcnRyYWl0OiB7IHc6IDI5LjcsIGg6IDQyIH0sXG4gICAgICAgICAgICBBM19zcXVhcmU6IHsgdzogMjkuNywgaDogMjkuNyB9LFxuICAgICAgICAgICAgQTNfdG9wU3BpcmFsTm90ZWJvb2s6IHsgdzogMjkuNywgaDogNDAuNSB9LFxuICAgICAgICAgICAgQTRfbGFuZHNjYXBlOiB7IHc6IDI5LjcsIGg6IDIxIH0sXG4gICAgICAgICAgICBBNF9wb3J0cmFpdDogeyB3OiAyMSwgaDogMjkuNyB9LFxuICAgICAgICAgICAgUDMyeDI0OiB7IHc6IDMyLCBoOiAyNCB9LFxuICAgICAgICAgICAgUDI0eDMyOiB7IHc6IDI0LCBoOiAzMiB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kcGlUb1BpeCA9IHtcbiAgICAgICAgICAgIDcyOiAzMCxcbiAgICAgICAgICAgIDE1MDogNTksXG4gICAgICAgICAgICAzMDA6IDExOFxuICAgICAgICB9XG4gICAgICAgIHRoaXMubmFtZXNwYWNlID0ge1xuICAgICAgICAgICAgaW5rc2NhcGU6ICdodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlJyxcbiAgICAgICAgICAgIHN2ZzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JvdXBzID0gW11cbiAgICAgICAgaWYgKG9wdGlvbnMucGFyZW50RWxlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudEVsZW0gPSBvcHRpb25zLnBhcmVudEVsZW1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHRoaXMucHJpbnRGb3JtYXRbb3B0aW9ucy5zaXplXSAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICAgICAgKG9wdGlvbnMuc2l6ZS53ICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5zaXplLmggIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRwaVRvUGl4W3RoaXMuZHBpXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEN1c3RvbSBzaXplXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLnNpemUudyAmJiBvcHRpb25zLnNpemUuaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53aWR0aCA9IG9wdGlvbnMuc2l6ZS53ICogdGhpcy5kcGlUb1BpeFt0aGlzLmRwaV1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5zaXplLmggKiB0aGlzLmRwaVRvUGl4W3RoaXMuZHBpXVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ00gc2l6ZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaXplID0gYCR7b3B0aW9ucy5zaXplLnd9eCR7b3B0aW9ucy5zaXplLmh9YFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmludFNpemUgPSBvcHRpb25zLnNpemVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBSZWZlcmVuY2VkIHByaW50IGZvcm1hdHNcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5wcmludEZvcm1hdFtvcHRpb25zLnNpemVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53aWR0aCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmludEZvcm1hdFtvcHRpb25zLnNpemVdLncgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHBpVG9QaXhbdGhpcy5kcGldXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmludEZvcm1hdFtvcHRpb25zLnNpemVdLmggKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHBpVG9QaXhbdGhpcy5kcGldXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3JtYXQgbmFtZSBzaXplXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSBvcHRpb25zLnNpemVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJpbnRTaXplID0gdGhpcy5wcmludEZvcm1hdFtvcHRpb25zLnNpemVdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgICAgICdEUEkgaXMgbm90IHNldCB0byA3MiwgMTUwIG9yIDMwMCwgd2UgY2Fubm90IGluaXRpYWxpemUgPHN2Zz4uJ1xuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAgICAgJ1dyb25nIGZvcm1hdCBwYXNzZWQsIHBvc3NpYmxlIG9wdGlvbnMgYXJlIDogJyxcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5wcmludEZvcm1hdCksXG4gICAgICAgICAgICAgICAgICAgICcgb3IgY3VzdG9tIHNpemUgb2JqZWN0IHt3OiB3aWR0aCwgaDogaGVpZ2h0fSdcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiV2UgY2FuJ3QgZm91bmQgSFRNTCBlbGVtZW50IHdoZXJlIHRvIGFkZCB0aGUgPHN2Zz4uXCIpXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIG1haW4gU1ZHIGRvbSBlbGVtZW50XG4gICAgICovXG4gICAgaW5pdCAoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmVudEVsZW0gJiYgdGhpcy53aWR0aCAmJiB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgLy8gaHRtbCBhbmQgaW5rc2FwZSBoZWFkZXIgKHRlc3RlZCBvbmx5IG9uIERlYmlhbiBJbmtzY2FwZSAxLjApXG4gICAgICAgICAgICB0aGlzLmVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModGhpcy5uYW1lc3BhY2Uuc3ZnLCAnc3ZnJylcbiAgICAgICAgICAgIHRoaXMuZWxlbS5zZXRBdHRyaWJ1dGUoJ3ZlcnNpb24nLCAnMS4xJylcbiAgICAgICAgICAgIHRoaXMuZWxlbS5zZXRBdHRyaWJ1dGUoJ3htbG5zJywgdGhpcy5uYW1lc3BhY2Uuc3ZnKVxuICAgICAgICAgICAgdGhpcy5lbGVtLnNldEF0dHJpYnV0ZSgneG1sbnM6c3ZnJywgdGhpcy5uYW1lc3BhY2Uuc3ZnKVxuICAgICAgICAgICAgdGhpcy5lbGVtLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAneG1sbnM6eGxpbmsnLFxuICAgICAgICAgICAgICAgICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJ1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgdGhpcy5lbGVtLnNldEF0dHJpYnV0ZSgneG1sbnM6aW5rc2NhcGUnLCB0aGlzLm5hbWVzcGFjZS5pbmtzY2FwZSlcblxuICAgICAgICAgICAgdGhpcy5lbGVtLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBgJHt0aGlzLnByaW50U2l6ZS53fWNtYClcbiAgICAgICAgICAgIHRoaXMuZWxlbS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIGAke3RoaXMucHJpbnRTaXplLmh9Y21gKVxuICAgICAgICAgICAgdGhpcy5lbGVtLnNldEF0dHJpYnV0ZSgndmlld0JveCcsIGAwIDAgJHt0aGlzLndpZHRofSAke3RoaXMuaGVpZ2h0fWApXG4gICAgICAgICAgICB0aGlzLmVsZW0uc2V0QXR0cmlidXRlKCdiYWNrZ3JvdW5kJywgdGhpcy5iYWNrZ3JvdW5kKVxuICAgICAgICAgICAgdGhpcy5lbGVtLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBgYmFja2dyb3VuZDogJHt0aGlzLmJhY2tncm91bmR9OyBib3gtc2hhZG93OiAwIDAuNWVtIDFlbSByZ2JhKDAsMCwwLDAuMSk7YClcbiAgICAgICAgICAgIHRoaXMuZWxlbS5zdHlsZS5hc3BlY3RSYXRpbyA9IGAke3RoaXMud2lkdGh9IC8gJHt0aGlzLmhlaWdodH1gXG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhbiBhcnJheSBvZiBncm91cCBpbnN0YW5jZSAoa2V5ID0gZ3JvdXAocHJvcHMubmFtZSkpXG4gICAgICAgICAgICB0aGlzLmdyb3VwcyA9IFtdXG4gICAgICAgICAgICB0aGlzLnBhcmVudEVsZW0uYXBwZW5kQ2hpbGQodGhpcy5lbGVtKVxuXG4gICAgICAgICAgICB0aGlzLnJlY3Qoe3g6IDAsIHk6IDAsIHc6IHRoaXMud2lkdGgsIGg6IHRoaXMuaGVpZ2h0LCBmaWxsOiB0aGlzLmJhY2tncm91bmR9KVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBldmVyeSBlbGVtZW50IGluIHRoZSBTVkcgZG9tIGVsZW1lbnRcbiAgICAgKi9cbiAgICBjbGVhciAoKSB7XG4gICAgICAgIHdoaWxlICh0aGlzLmVsZW0uZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtLnJlbW92ZUNoaWxkKHRoaXMuZWxlbS5maXJzdENoaWxkKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JvdXBzID0gW11cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGV2ZXJ5dGhpbmcgaW4gZ3JvdXBzIChkb20pIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIHsoc3RyaW5nW118Ym9vbGVhbil9IGdyb3VwcyAtIChvcHRpb25hbCkgYXJyYXkgb2Ygc3BlY2lmaWMgZ3JvdXBzIHRvIGNsZWFyIG9yIGZhbHNlIChjbGVhciBhbGwgZ3JvdXBzKVxuICAgICAqL1xuICAgIGNsZWFyR3JvdXBzIChncm91cHMgPSBmYWxzZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGdyb3VwX25hbWUgaW4gdGhpcy5ncm91cHMpIHtcbiAgICAgICAgICAgIGlmICghZ3JvdXBzIHx8IGdyb3Vwcy5pbmNsdWRlcyhncm91cF9uYW1lKSkge1xuICAgICAgICAgICAgICAgIHdoaWxlICh0aGlzLmdyb3Vwc1tncm91cF9uYW1lXS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBzW2dyb3VwX25hbWVdLnJlbW92ZUNoaWxkKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91cHNbZ3JvdXBfbmFtZV0uZmlyc3RDaGlsZFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBlbGVtIHRvIHN2ZyBncm91cFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBncm91cCAtIHRoZSBncm91cCBuYW1lXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHN2Z0l0ZW0gLSB0aGUgbm9kZSBlbGVtZW50IChwYXRoLCBjaXJjbGUuLi4pIHRvIGFwcGVuZFxuICAgICAqL1xuICAgIGFwcGVuZFRvR3JvdXAgKGdyb3VwLCBzdmdJdGVtKSB7XG4gICAgICAgIGlmICh0aGlzLmdyb3VwcyAhPT0gdW5kZWZpbmVkIHx8IHRoaXMuZ3JvdXBzW2dyb3VwXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoc3ZnSXRlbSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cHNbZ3JvdXBdLmFwcGVuZENoaWxkKHN2Z0l0ZW0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIFwiVGhlIFNWRyBlbGVtZW50IGlzIG5vdCBzZXQsIGFuZCBjYW4ndCBiZSBhZGRlZCB0byBncm91cFwiXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgR3JvdXAgJHtncm91cH0gZG9lc24ndCBleGlzdC5gKVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERyYXdpbmcgYSByZWN0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcmVjdFByb3BzIHJlY3RhbmdsZSBwcm9wZXJ0aWVzXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHggLSB0b3AgbGVmdCB4IGNvb3JkaW5hdGUgb2YgdGhlIHJlY3RhbmdsZVxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB5IC0gdG9wIGxlZnQgeSBjb29yZGluYXRlIG9mIHRoZSByZWN0YW5nbGVcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gdyAtIHdpZHRoIG9mIHRoZSByZWN0YW5nbGVcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gaCAtIGhlaWdodCBvZiB0aGUgcmVjdGFuZ2xlXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGZpbGwgLSBiYWNrZ3JvdW5kIGNvbG9yIG5hbWUgb3IgY29sb3IgdmFsdWUgKEhFWCwgUkdCLCBIU0wpXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IHN0cm9rZSAtIGJvcmRlciBjb2xvciBuYW1lIG9yIGNvbG9yIHZhbHVlIChIRVgsIFJHQiwgSFNMKVxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBncm91cCAtIGdyb3VwIG5hbWUgaWYgeW91IHdhbnQgdG8gYWRkIHJlY3QgdG8gYSBzcGVjaWZpYyBncm91cFxuICAgICAqL1xuICAgIHJlY3QgKHJlY3RQcm9wcykge1xuICAgICAgICByZWN0UHJvcHMueCA9IHJlY3RQcm9wcy54ID09PSB1bmRlZmluZWQgPyAwIDogcmVjdFByb3BzLnhcbiAgICAgICAgcmVjdFByb3BzLnkgPSByZWN0UHJvcHMueSA9PT0gdW5kZWZpbmVkID8gMCA6IHJlY3RQcm9wcy55XG4gICAgICAgIHJlY3RQcm9wcy53ID0gcmVjdFByb3BzLncgPT09IHVuZGVmaW5lZCA/IDAgOiByZWN0UHJvcHMud1xuICAgICAgICByZWN0UHJvcHMuaCA9IHJlY3RQcm9wcy5oID09PSB1bmRlZmluZWQgPyAwIDogcmVjdFByb3BzLmhcbiAgICAgICAgcmVjdFByb3BzLmZpbGwgPSByZWN0UHJvcHMuZmlsbCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiByZWN0UHJvcHMuZmlsbFxuICAgICAgICByZWN0UHJvcHMuc3Ryb2tlID1cbiAgICAgICAgICAgIHJlY3RQcm9wcy5zdHJva2UgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogcmVjdFByb3BzLnN0cm9rZVxuICAgICAgICByZWN0UHJvcHMuZ3JvdXAgPVxuICAgICAgICAgICAgcmVjdFByb3BzLmdyb3VwID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHJlY3RQcm9wcy5ncm91cFxuXG4gICAgICAgIGNvbnN0IHJlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModGhpcy5uYW1lc3BhY2Uuc3ZnLCAncmVjdCcpXG5cbiAgICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3gnLCByZWN0UHJvcHMueClcbiAgICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3knLCByZWN0UHJvcHMueSlcbiAgICAgICAgcmVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgcmVjdFByb3BzLncpXG4gICAgICAgIHJlY3Quc2V0QXR0cmlidXRlKCdoZWlnaHQnLCByZWN0UHJvcHMuaClcblxuICAgICAgICBpZiAocmVjdFByb3BzLmZpbGwpIHJlY3Quc2V0QXR0cmlidXRlKCdmaWxsJywgcmVjdFByb3BzLmZpbGwpXG4gICAgICAgIGlmIChyZWN0UHJvcHMuc3Ryb2tlKSByZWN0LnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgcmVjdFByb3BzLnN0cm9rZSlcblxuICAgICAgICBpZiAocmVjdFByb3BzLmdyb3VwKSB7XG4gICAgICAgICAgICB0aGlzLmFwcGVuZFRvR3JvdXAocmVjdFByb3BzLmdyb3VwLCByZWN0KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbGVtLmFwcGVuZENoaWxkKHJlY3QpXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRHJhdyBhIGNpcmNsZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjaXJjbGVQcm9wcyBjaXJjbGUgcHJvcGVydGllc1xuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSB4IC0geCBjb29yZGluYXRlIG9mIHRoZSBjaXJjbGUgY2VudGVyXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHkgLSB5IGNvb3JkaW5hdGUgb2YgdGhlIGNpcmNsZSBjZW50ZXJcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gciAtIHJhZGl1cyBvZiB0aGUgY2lyY2xlXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGZpbGwgLSBiYWNrZ3JvdW5kIGNvbG9yIG5hbWUgb3IgY29sb3IgdmFsdWUgKEhFWCwgUkdCLCBIU0wpXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IHN0cm9rZSAtIGJvcmRlciBjb2xvciBuYW1lIG9yIGNvbG9yIHZhbHVlIChIRVgsIFJHQiwgSFNMKVxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBncm91cCAtIGdyb3VwIG5hbWUgaWYgeW91IHdhbnQgdG8gYWRkIHJlY3QgdG8gYSBzcGVjaWZpYyBncm91cFxuICAgICAqL1xuICAgIGNpcmNsZSAoY2lyY2xlUHJvcHMpIHtcbiAgICAgICAgY2lyY2xlUHJvcHMueCA9IGNpcmNsZVByb3BzLnggPT09IHVuZGVmaW5lZCA/IDAgOiBjaXJjbGVQcm9wcy54XG4gICAgICAgIGNpcmNsZVByb3BzLnkgPSBjaXJjbGVQcm9wcy55ID09PSB1bmRlZmluZWQgPyAwIDogY2lyY2xlUHJvcHMueVxuICAgICAgICBjaXJjbGVQcm9wcy5yID0gY2lyY2xlUHJvcHMuciA9PT0gdW5kZWZpbmVkID8gMCA6IGNpcmNsZVByb3BzLnJcbiAgICAgICAgY2lyY2xlUHJvcHMuZmlsbCA9XG4gICAgICAgICAgICBjaXJjbGVQcm9wcy5maWxsID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGNpcmNsZVByb3BzLmZpbGxcbiAgICAgICAgY2lyY2xlUHJvcHMuc3Ryb2tlID1cbiAgICAgICAgICAgIGNpcmNsZVByb3BzLnN0cm9rZSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBjaXJjbGVQcm9wcy5zdHJva2VcbiAgICAgICAgY2lyY2xlUHJvcHMuZ3JvdXAgPVxuICAgICAgICAgICAgY2lyY2xlUHJvcHMuZ3JvdXAgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogY2lyY2xlUHJvcHMuZ3JvdXBcblxuICAgICAgICBjb25zdCBjaXJjbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModGhpcy5uYW1lc3BhY2Uuc3ZnLCAnY2lyY2xlJylcbiAgICAgICAgY2lyY2xlLnNldEF0dHJpYnV0ZSgnY3gnLCBjaXJjbGVQcm9wcy54KVxuICAgICAgICBjaXJjbGUuc2V0QXR0cmlidXRlKCdjeScsIGNpcmNsZVByb3BzLnkpXG4gICAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ3InLCBjaXJjbGVQcm9wcy5yKVxuXG4gICAgICAgIGlmIChjaXJjbGVQcm9wcy5maWxsKSBjaXJjbGUuc2V0QXR0cmlidXRlKCdmaWxsJywgY2lyY2xlUHJvcHMuZmlsbClcbiAgICAgICAgaWYgKGNpcmNsZVByb3BzLnN0cm9rZSlcbiAgICAgICAgICAgIGNpcmNsZS5zZXRBdHRyaWJ1dGUoJ3N0cm9rZScsIGNpcmNsZVByb3BzLnN0cm9rZSlcblxuICAgICAgICBpZiAoY2lyY2xlUHJvcHMuZ3JvdXApIHtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kVG9Hcm91cChjaXJjbGVQcm9wcy5ncm91cCwgY2lyY2xlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbGVtLmFwcGVuZENoaWxkKGNpcmNsZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEcmF3IHRyaWFuZ2xlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHRyaWFuZ2xlUHJvcHMgdHJpYW5nbGUgcHJvcGVydGllc1xuICAgICAqIEBwcm9wZXJ0eSB7YXJyYXl9IHBvaW50cyAtIHR3byBkaW1lbnNpb25hbCBhcnJheSAocG9pbnRzW25dID0gW3ggY29vcmRpbmF0ZSwgeSBjb29yZGluYXRlXSlcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gZmlsbCAtIGJhY2tncm91bmQgY29sb3IgbmFtZSBvciBjb2xvciB2YWx1ZSAoSEVYLCBSR0IsIEhTTClcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gc3Ryb2tlIC0gYm9yZGVyIGNvbG9yIG5hbWUgb3IgY29sb3IgdmFsdWUgKEhFWCwgUkdCLCBIU0wpXG4gICAgICogQHByb3BlcnR5IHtib29sZWFufSBjbG9zZSAtIGRldGVybWluZSBpZiBwYXRoIGlzIGNsb3NlZCBvciBvcGVuXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IG5hbWUgLSBhIG5hbWUgYXR0cmlidXRlXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGdyb3VwIC0gZ3JvdXAgbmFtZSBpZiB5b3Ugd2FudCB0byBhZGQgcGF0aCB0byBhIHNwZWNpZmljIGdyb3VwXG4gICAgICovXG4gICAgdHJpYW5nbGUgKHRyaWFuZ2xlUHJvcHMpIHtcbiAgICAgICAgaWYgKHRyaWFuZ2xlUHJvcHMucG9pbnRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgICAgJ1lvdSBtdXN0IHNwZWNpZnkgMyBwb2ludHMgaW4gcHJvcGVydHkgb2JqZWN0IHRvIGRyYXcgYSB0cmlhbmdsZSdcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRyaWFuZ2xlUHJvcHMucG9pbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICBcIkl0IHNlZW1zIHRoYXQgdHJpYW5nbGVQcm9wcy5wb2ludHMgZG9lc24ndCBoYXZlIHRocmVlIHBvaW50cy5cIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmlhbmdsZVByb3BzLnBvaW50cy5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICAgICAgJ1Byb3BzLnBvaW50IGNvbnRhaW5zIG1vcmUgdGhhbiAzIGNvb3JkaW5hdGVzLCB0cmlhbmdsZSB3aWxsIG9ubHkgdXNlIHRoZSB0aHJlZSBmaXJzdCBvbmVzLidcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdHJpYW5nbGVQcm9wcy5maWxsID1cbiAgICAgICAgICAgIHRyaWFuZ2xlUHJvcHMuZmlsbCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiB0cmlhbmdsZVByb3BzLmZpbGxcbiAgICAgICAgdHJpYW5nbGVQcm9wcy5zdHJva2UgPVxuICAgICAgICAgICAgdHJpYW5nbGVQcm9wcy5zdHJva2UgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogdHJpYW5nbGVQcm9wcy5zdHJva2VcbiAgICAgICAgdHJpYW5nbGVQcm9wcy5jbG9zZSA9XG4gICAgICAgICAgICB0cmlhbmdsZVByb3BzLmNsb3NlID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHRyaWFuZ2xlUHJvcHMuY2xvc2VcbiAgICAgICAgdHJpYW5nbGVQcm9wcy5uYW1lID1cbiAgICAgICAgICAgIHRyaWFuZ2xlUHJvcHMubmFtZSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiB0cmlhbmdsZVByb3BzLm5hbWVcbiAgICAgICAgdHJpYW5nbGVQcm9wcy5ncm91cCA9XG4gICAgICAgICAgICB0cmlhbmdsZVByb3BzLmdyb3VwID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHRyaWFuZ2xlUHJvcHMuZ3JvdXBcblxuICAgICAgICBjb25zdCB0cmlhbmdsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh0aGlzLm5hbWVzcGFjZS5zdmcsICdwYXRoJylcbiAgICAgICAgdHJpYW5nbGUuc2V0QXR0cmlidXRlKFxuICAgICAgICAgICAgJ2QnLFxuICAgICAgICAgICAgJ00gJyArXG4gICAgICAgICAgICB0cmlhbmdsZVByb3BzLnBvaW50c1swXVswXSArXG4gICAgICAgICAgICAnLCcgK1xuICAgICAgICAgICAgdHJpYW5nbGVQcm9wcy5wb2ludHNbMF1bMV0gK1xuICAgICAgICAgICAgJ0wgJyArXG4gICAgICAgICAgICB0cmlhbmdsZVByb3BzLnBvaW50c1sxXVswXSArXG4gICAgICAgICAgICAnLCcgK1xuICAgICAgICAgICAgdHJpYW5nbGVQcm9wcy5wb2ludHNbMV1bMV0gK1xuICAgICAgICAgICAgJ0wgJyArXG4gICAgICAgICAgICB0cmlhbmdsZVByb3BzLnBvaW50c1syXVswXSArXG4gICAgICAgICAgICAnLCcgK1xuICAgICAgICAgICAgdHJpYW5nbGVQcm9wcy5wb2ludHNbMl1bMV0gK1xuICAgICAgICAgICAgJ1onXG4gICAgICAgIClcbiAgICAgICAgaWYgKHRyaWFuZ2xlUHJvcHMuZmlsbClcbiAgICAgICAgICAgIHRyaWFuZ2xlLnNldEF0dHJpYnV0ZSgnZmlsbCcsIHRyaWFuZ2xlUHJvcHMuZmlsbClcbiAgICAgICAgaWYgKHRyaWFuZ2xlUHJvcHMuc3Ryb2tlKVxuICAgICAgICAgICAgdHJpYW5nbGUuc2V0QXR0cmlidXRlKCdzdHJva2UnLCB0cmlhbmdsZVByb3BzLnN0cm9rZSlcbiAgICAgICAgaWYgKHRyaWFuZ2xlUHJvcHMubmFtZSlcbiAgICAgICAgICAgIHRyaWFuZ2xlLnNldEF0dHJpYnV0ZSgnbmFtZScsIHRyaWFuZ2xlUHJvcHMubmFtZSlcbiAgICAgICAgaWYgKHRyaWFuZ2xlUHJvcHMuZ3JvdXApIHtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kVG9Hcm91cCh0cmlhbmdsZVByb3BzLmdyb3VwLCB0cmlhbmdsZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbS5hcHBlbmRDaGlsZCh0cmlhbmdsZSlcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEcmF3IGxpbmVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGF0aFByb3BzIHBhdGggcHJvcGVydGllc1xuICAgICAqIEBwcm9wZXJ0eSB7YXJyYXl9IHBvaW50cyAtIHR3byBkaW1lbnNpb25hbCBhcnJheSAocG9pbnRzW25dID0gW3ggY29vcmRpbmF0ZSwgeSBjb29yZGluYXRlXSlcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gZmlsbCAtIGJhY2tncm91bmQgY29sb3IgbmFtZSBvciBjb2xvciB2YWx1ZSAoSEVYLCBSR0IsIEhTTClcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gc3Ryb2tlIC0gYm9yZGVyIGNvbG9yIG5hbWUgb3IgY29sb3IgdmFsdWUgKEhFWCwgUkdCLCBIU0wpXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHN0cm9rZVdpZHRoIC0gYm9yZGVyIHdpZHRoIGluIHBpeGVscyBwb3NpdGl2ZSBpbnQgb25seVxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gY2xvc2UgLSBkZXRlcm1pbmUgaWYgcGF0aCBpcyBjbG9zZWQgb3Igb3BlblxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBuYW1lIC0gYSBuYW1lIGF0dHJpYnV0ZVxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBncm91cCAtIGdyb3VwIG5hbWUgaWYgeW91IHdhbnQgdG8gYWRkIHBhdGggdG8gYSBzcGVjaWZpYyBncm91cFxuICAgICAqL1xuICAgIHBhdGggKHBhdGhQcm9wcykge1xuICAgICAgICBpZiAocGF0aFByb3BzLnBvaW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdZb3UgbXVzdCBzcGVjaWZ5IHBvaW50cyBjb29yZGluYXRlcyB0byBkcmF3IGEgbGluZScpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBwYXRoUHJvcHMuZmlsbCA9IHBhdGhQcm9wcy5maWxsID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHBhdGhQcm9wcy5maWxsXG4gICAgICAgIHBhdGhQcm9wcy5zdHJva2UgPVxuICAgICAgICAgICAgcGF0aFByb3BzLnN0cm9rZSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBwYXRoUHJvcHMuc3Ryb2tlXG4gICAgICAgIHBhdGhQcm9wcy5zdHJva2VXaWR0aCA9XG4gICAgICAgICAgICBwYXRoUHJvcHMuc3Ryb2tlV2lkdGggPT09IHVuZGVmaW5lZCB8fCBOdW1iZXIocGF0aFByb3BzLnNldEF0dHIpID4gMVxuICAgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgICAgICA6IHBhdGhQcm9wcy5zdHJva2VXaWR0aFxuICAgICAgICBwYXRoUHJvcHMuY2xvc2UgPVxuICAgICAgICAgICAgcGF0aFByb3BzLmNsb3NlID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHBhdGhQcm9wcy5jbG9zZVxuICAgICAgICBwYXRoUHJvcHMubmFtZSA9IHBhdGhQcm9wcy5uYW1lID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHBhdGhQcm9wcy5uYW1lXG4gICAgICAgIHBhdGhQcm9wcy5ncm91cCA9XG4gICAgICAgICAgICBwYXRoUHJvcHMuZ3JvdXAgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogcGF0aFByb3BzLmdyb3VwXG5cbiAgICAgICAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh0aGlzLm5hbWVzcGFjZS5zdmcsICdwYXRoJylcblxuICAgICAgICBjb25zdCBwb2ludHMgPSBwYXRoUHJvcHMucG9pbnRzIC8vLmZpbHRlcihwdCA9PiBwdFswXSAhPT0gdW5kZWZpbmVkICYmIHB0WzFdICE9PSB1bmRlZmluZWQpXG5cbiAgICAgICAgbGV0IGQgPSAnJ1xuICAgICAgICBpZiAocG9pbnRzWzBdWzBdICE9PSB1bmRlZmluZWQgJiYgcG9pbnRzWzBdWzFdICE9PSB1bmRlZmluZWQpIHtcblxuICAgICAgICAgICAgZCArPSBgTSAke3BvaW50c1swXVswXX0gJHtwb2ludHNbMF1bMV19YFxuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChwb2ludHNbaV1bMF0gIT09IHVuZGVmaW5lZCAmJiBwb2ludHNbaV1bMV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBkICs9IGAgTCR7cG9pbnRzW2ldWzBdfSAke3BvaW50c1tpXVsxXX1gXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwYXRoUHJvcHMuY2xvc2UgJiYgcG9pbnRzWzBdWzBdICE9PSB1bmRlZmluZWQgJiYgcG9pbnRzWzBdWzFdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGQgKz0gYCBMJHtwb2ludHNbMF1bMF19ICR7cG9pbnRzWzBdWzFdfWBcbiAgICAgICAgfVxuICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZSgnZCcsIGQpXG4gICAgICAgIGlmIChwYXRoUHJvcHMuZmlsbCkgcGF0aC5zZXRBdHRyaWJ1dGUoJ2ZpbGwnLCBwYXRoUHJvcHMuZmlsbClcbiAgICAgICAgaWYgKHBhdGhQcm9wcy5zdHJva2UpIHBhdGguc2V0QXR0cmlidXRlKCdzdHJva2UnLCBwYXRoUHJvcHMuc3Ryb2tlKVxuICAgICAgICBpZiAocGF0aFByb3BzLnN0cm9rZVdpZHRoKVxuICAgICAgICAgICAgcGF0aC5zZXRBdHRyaWJ1dGUoJ3N0cm9rZS13aWR0aCcsIHBhdGhQcm9wcy5zdHJva2VXaWR0aClcbiAgICAgICAgaWYgKHBhdGhQcm9wcy5uYW1lKSBwYXRoLnNldEF0dHJpYnV0ZSgnbmFtZScsIHBhdGhQcm9wcy5uYW1lKVxuICAgICAgICBpZiAocGF0aFByb3BzLmdyb3VwKSB7XG4gICAgICAgICAgICB0aGlzLmFwcGVuZFRvR3JvdXAocGF0aFByb3BzLmdyb3VwLCBwYXRoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbGVtLmFwcGVuZENoaWxkKHBhdGgpXG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRHJhdyB0ZXh0XG4gICAgICogQHBhcmFtIHRleHRQcm9wcyB0ZXh0IHByb3BlcnRpZXNcbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0geCAtIHRvcCBsZWZ0IHggY29vcmRpbmF0ZSB0ZXh0IHBvc2l0aW9uXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IHkgLSB0b3AgbGVmdCB5IGNvb3JkaW5hdGUgdGV4dCBwb3NpdGlvblxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0ZXh0IC0gdGhlIHRleHQgdG8gZHJhd1xuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBmb250RmFtaWx5IC0gZm9udCBmYW1pbHkgbmFtZSBvZiB0aGUgdGV4dFxuICAgICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBmb250U2l6ZSAtIGZvbnQgc2l6ZSBvZiB0aGUgdGV4dFxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBmaWxsIC0gY29sb3Igb2YgdGV4dFxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBhbmNob3IgLSBob3Jpem9udGFsIGFsaWdubWVudCAoc3RhcnQsIG1pZGRsZSBvciBlbmQpXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IG5hbWUgLSBhIG5hbWUgYXR0cmlidXRlXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGdyb3VwIC0gZ3JvdXAgbmFtZSBpZiB5b3Ugd2FudCB0byBhZGQgcGF0aCB0byBhIHNwZWNpZmljIGdyb3VwXG4gICAgICovXG4gICAgdGV4dCAodGV4dFByb3BzKSB7XG4gICAgICAgIGlmICh0ZXh0UHJvcHMueCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdZb3UgbmVlZCB0byBzcGVjaWZ5IHggcHJvcGVydHknKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRleHRQcm9wcy55ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1lvdSBuZWVkIHRvIHNwZWNpZnkgeSBwcm9wZXJ0eScpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAodGV4dFByb3BzLnRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignWW91IG5lZWQgdG8gc3BlY2lmeSB0aGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkJylcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgdGV4dFByb3BzLmZvbnRGYW1pbHkgPVxuICAgICAgICAgICAgdGV4dFByb3BzLmZvbnRGYW1pbHkgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgID8gJ3NhbnMtc2VyaWYnXG4gICAgICAgICAgICAgICAgOiB0ZXh0UHJvcHMuZm9udEZhbWlseVxuICAgICAgICB0ZXh0UHJvcHMuZm9udFNpemUgPVxuICAgICAgICAgICAgdGV4dFByb3BzLmZvbnRTaXplID09PSB1bmRlZmluZWQgPyAxNiA6IHRleHRQcm9wcy5mb250U2l6ZVxuICAgICAgICB0ZXh0UHJvcHMuZmlsbCA9IHRleHRQcm9wcy5maWxsID09PSB1bmRlZmluZWQgPyAnYmxhY2snIDogdGV4dFByb3BzLmZpbGxcbiAgICAgICAgdGV4dFByb3BzLmFuY2hvciA9XG4gICAgICAgICAgICB0ZXh0UHJvcHMuZ3JvdXAgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgICAgICAgICFbJ3N0YXJ0JywgJ21pZGRsZScsICdlbmQnXS5pbmNsdWRlcyh0ZXh0UHJvcHMuYW5jaG9yKVxuICAgICAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgICAgICA6IHRleHRQcm9wcy5hbmNob3JcbiAgICAgICAgdGV4dFByb3BzLm5hbWUgPSB0ZXh0UHJvcHMubmFtZSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiB0ZXh0UHJvcHMubmFtZVxuICAgICAgICB0ZXh0UHJvcHMuZ3JvdXAgPVxuICAgICAgICAgICAgdGV4dFByb3BzLmdyb3VwID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHRleHRQcm9wcy5ncm91cFxuXG4gICAgICAgIGNvbnN0IHRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModGhpcy5uYW1lc3BhY2Uuc3ZnLCAndGV4dCcpXG4gICAgICAgIHRleHQuc2V0QXR0cmlidXRlKCd4JywgdGV4dFByb3BzLngpXG4gICAgICAgIHRleHQuc2V0QXR0cmlidXRlKCd5JywgdGV4dFByb3BzLnkpXG4gICAgICAgIHRleHQuc2V0QXR0cmlidXRlKCdmb250LWZhbWlseScsIHRleHRQcm9wcy5mb250RmFtaWx5KVxuICAgICAgICB0ZXh0LnNldEF0dHJpYnV0ZSgnZm9udC1zaXplJywgdGV4dFByb3BzLmZvbnRTaXplKVxuICAgICAgICB0ZXh0LnNldEF0dHJpYnV0ZSgnZmlsbCcsIHRleHRQcm9wcy5maWxsKVxuXG4gICAgICAgIGlmICh0ZXh0UHJvcHMubmFtZSkgdGV4dC5zZXRBdHRyaWJ1dGUoJ25hbWUnLCB0ZXh0UHJvcHMubmFtZSlcbiAgICAgICAgaWYgKHRleHRQcm9wcy5hbmNob3IpIHRleHQuc2V0QXR0cmlidXRlKCd0ZXh0LWFuY2hvcicsIHRleHRQcm9wcy5hbmNob3IpXG5cbiAgICAgICAgdGV4dC5pbm5lckhUTUwgPSB0ZXh0UHJvcHMudGV4dFxuXG4gICAgICAgIGlmICh0ZXh0UHJvcHMuZ3JvdXApIHtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kVG9Hcm91cCh0ZXh0UHJvcHMuZ3JvdXAsIHRleHQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVsZW0uYXBwZW5kQ2hpbGQodGV4dClcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZ3JvdXBcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZ3JvdXBQcm9wcyBncm91cCBwcm9wZXJ0aWVzXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IG5hbWUgLSBhbiB1bmlxdWUgZ3JvdXAgbmFtZVxuICAgICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzdHJva2UgLSBhIHN0cm9rZSBjb2xvciBhdHRyaWJ1dGVcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gc3Ryb2tlV2lkdGggLSBhIHN0cm9rZS13aWR0aCBjb2xvciBhdHRyaWJ1dGVcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gZmlsbCAtIGEgdmFsdWUgb2YgdGhlIGZpbGwgYXR0cmlidXRlXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGdyb3VwIC0gZ3JvdXAgbmFtZSBhbiBvdGhlciBncm91cCB0byBuZXN0IHRoZSBuZXcgb25lXG4gICAgICogQHByb3BlcnR5IHtzdHJpbmd9IGlkIC0gdGVzdGluZyBpbmtzY2FwZSBsYXllclxuICAgICAqL1xuICAgIGdyb3VwIChncm91cFByb3BzKSB7XG4gICAgICAgIGlmIChncm91cFByb3BzLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgICAnWW91IG11c3Qgc3BlY2lmaWVkIGEgbmFtZSBiZWNhdXNlIHlvdSBuZWVkIGl0IHRvIGZpbGwgZ3JvdXAgYWZ0ZXIgY3JlYXRlZCBpdCdcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGdyb3VwUHJvcHMuZmlsbCA9XG4gICAgICAgICAgICBncm91cFByb3BzLmZpbGwgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogZ3JvdXBQcm9wcy5maWxsXG4gICAgICAgIGdyb3VwUHJvcHMuc3Ryb2tlID1cbiAgICAgICAgICAgIGdyb3VwUHJvcHMuc3Ryb2tlID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGdyb3VwUHJvcHMuc3Ryb2tlXG4gICAgICAgIGdyb3VwUHJvcHMuZ3JvdXAgPVxuICAgICAgICAgICAgZ3JvdXBQcm9wcy5ncm91cCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBncm91cFByb3BzLmdyb3VwXG4gICAgICAgIGdyb3VwUHJvcHMuc3Ryb2tlV2lkdGggPVxuICAgICAgICAgICAgZ3JvdXBQcm9wcy5zdHJva2VXaWR0aCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgICAgIDogZ3JvdXBQcm9wcy5zdHJva2VXaWR0aFxuICAgICAgICBncm91cFByb3BzLmlkID1cbiAgICAgICAgICAgIGdyb3VwUHJvcHMuaWQgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogJ2xheWVyJyArIGdyb3VwUHJvcHMuaWRcblxuICAgICAgICBjb25zdCBncm91cEVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModGhpcy5uYW1lc3BhY2Uuc3ZnLCAnZycpXG4gICAgICAgIGlmIChncm91cFByb3BzLm5hbWUpIHtcbiAgICAgICAgICAgIGdyb3VwRWxlbS5zZXRBdHRyaWJ1dGUoJ25hbWUnLCBncm91cFByb3BzLm5hbWUpXG4gICAgICAgICAgICBncm91cEVsZW0uc2V0QXR0cmlidXRlTlMoXG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lc3BhY2UuaW5rc2NhcGUsXG4gICAgICAgICAgICAgICAgJ2lua3NjYXBlOmxhYmVsJyxcbiAgICAgICAgICAgICAgICBncm91cFByb3BzLm5hbWVcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGdyb3VwRWxlbS5zZXRBdHRyaWJ1dGVOUyhcbiAgICAgICAgICAgICAgICB0aGlzLm5hbWVzcGFjZS5pbmtzY2FwZSxcbiAgICAgICAgICAgICAgICAnaW5rc2NhcGU6Z3JvdXBtb2RlJyxcbiAgICAgICAgICAgICAgICAnbGF5ZXInXG4gICAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdyb3VwUHJvcHMuaWQpIGdyb3VwRWxlbS5zZXRBdHRyaWJ1dGUoJ2lkJywgZ3JvdXBQcm9wcy5pZClcbiAgICAgICAgaWYgKGdyb3VwUHJvcHMuZmlsbCkgZ3JvdXBFbGVtLnNldEF0dHJpYnV0ZSgnZmlsbCcsIGdyb3VwUHJvcHMuZmlsbClcbiAgICAgICAgaWYgKGdyb3VwUHJvcHMuc3Ryb2tlKVxuICAgICAgICAgICAgZ3JvdXBFbGVtLnNldEF0dHJpYnV0ZSgnc3Ryb2tlJywgZ3JvdXBQcm9wcy5zdHJva2UpXG4gICAgICAgIGlmIChncm91cFByb3BzLnN0cm9rZVdpZHRoKVxuICAgICAgICAgICAgZ3JvdXBFbGVtLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLXdpZHRoJywgZ3JvdXBQcm9wcy5zdHJva2VXaWR0aClcblxuICAgICAgICBpZiAoZ3JvdXBQcm9wcy5ncm91cCkge1xuICAgICAgICAgICAgdGhpcy5hcHBlbmRUb0dyb3VwKGdyb3VwUHJvcHMuZ3JvdXAsIGdyb3VwRWxlbSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbS5hcHBlbmRDaGlsZChncm91cEVsZW0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncm91cHNbZ3JvdXBQcm9wcy5uYW1lXSA9IGdyb3VwRWxlbVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeHBvcnQgU1ZHIGRvbSBlbGVtZW50IGFzIGZpbGUgKGdyb3VwcyB3aWxsIGFwcGVhciBpbiBJbmtjYXBlIGFzIGxheWVycylcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXhwb3J0T3B0aW9ucyBzdmYgZXhwb3J0IG9wdGlvbnNcbiAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gbmFtZSAtIGZpbGVuYW1lIHByZWZpeCAod2lsbCBiZSBzdWZmaXhlZCBieSBhIHRpbWVzdGFtcClcbiAgICAgKi9cbiAgICBleHBvcnQgKGV4cG9ydE9wdGlvbnMpIHtcbiAgICAgICAgZXhwb3J0T3B0aW9ucy5uYW1lID1cbiAgICAgICAgICAgIGV4cG9ydE9wdGlvbnMubmFtZSA9PT0gdW5kZWZpbmVkID8gJ3VudGl0bGVkJyA6IGV4cG9ydE9wdGlvbnMubmFtZVxuICAgICAgICBsZXQgc3ZnRmlsZSA9IG51bGxcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKCksXG4gICAgICAgICAgICBZID0gZGF0ZS5nZXRGdWxsWWVhcigpLFxuICAgICAgICAgICAgbSA9IGRhdGUuZ2V0TW9udGgoKSxcbiAgICAgICAgICAgIGQgPSBkYXRlLmdldERheSgpLFxuICAgICAgICAgICAgSCA9IGRhdGUuZ2V0SG91cnMoKSxcbiAgICAgICAgICAgIGkgPSBkYXRlLmdldE1pbnV0ZXMoKVxuXG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gYCR7ZXhwb3J0T3B0aW9ucy5uYW1lfS4ke3RoaXMuc2l6ZX0uJHtZfS0ke219LSR7ZH1fJHtIfS4ke2l9LnN2Z2BcbiAgICAgICAgY29uc3Qgc3ZnTWFya3VwID0gYDw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCIgc3RhbmRhbG9uZT1cIm5vXCI/PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5lbGVtLm91dGVySFRNTH1gXG4gICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgQmxvYihbc3ZnTWFya3VwXSwge1xuICAgICAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uL3htbCcgLy8ndGV4dC9wbGFpbidcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKHN2Z0ZpbGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKHN2Z0ZpbGUpXG4gICAgICAgIH1cbiAgICAgICAgc3ZnRmlsZSA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGRhdGEpXG5cbiAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgICAgICBsaW5rLmhyZWYgPSBzdmdGaWxlXG4gICAgICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZVxuICAgICAgICBsaW5rLmNsaWNrKClcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGEgY2VudGltZXRlciBzaXplIHRvIHBpeGVscyBmcm9tIGN1cnJlbnQgRFBJXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNtIGNtIHNpemUgdG8gY29udmVydFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHB4IHNpemUgY29udmVydGVkXG4gICAgICovXG4gICAgY21Ub1BpeGVscyAoY20pIHtcbiAgICAgICAgaWYgKCFpc05hTihjbSkpIHtcbiAgICAgICAgICAgIHJldHVybiBjbSAqIHRoaXMuZHBpVG9QaXhbdGhpcy5kcGldXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgICAgICdUaGUgbWV0aG9kIGNtVG9QaXhlbHMoKSBtdXN0IGJlIGNhbGxlZCB3aXRoIGEgbnVtYmVyIGluIGNlbnRpbWV0ZXJzLidcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8qXG4gKiBBIGZhc3QgamF2YXNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiBzaW1wbGV4IG5vaXNlIGJ5IEpvbmFzIFdhZ25lclxuXG5CYXNlZCBvbiBhIHNwZWVkLWltcHJvdmVkIHNpbXBsZXggbm9pc2UgYWxnb3JpdGhtIGZvciAyRCwgM0QgYW5kIDREIGluIEphdmEuXG5XaGljaCBpcyBiYXNlZCBvbiBleGFtcGxlIGNvZGUgYnkgU3RlZmFuIEd1c3RhdnNvbiAoc3RlZ3VAaXRuLmxpdS5zZSkuXG5XaXRoIE9wdGltaXNhdGlvbnMgYnkgUGV0ZXIgRWFzdG1hbiAocGVhc3RtYW5AZHJpenpsZS5zdGFuZm9yZC5lZHUpLlxuQmV0dGVyIHJhbmsgb3JkZXJpbmcgbWV0aG9kIGJ5IFN0ZWZhbiBHdXN0YXZzb24gaW4gMjAxMi5cblxuIENvcHlyaWdodCAoYykgMjAyMiBKb25hcyBXYWduZXJcblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuIFNPRlRXQVJFLlxuICovXG4vLyB0aGVzZSAjX19QVVJFX18gY29tbWVudHMgaGVscCB1Z2xpZnlqcyB3aXRoIGRlYWQgY29kZSByZW1vdmFsXG4vLyBcbmNvbnN0IEYyID0gLyojX19QVVJFX18qLyAwLjUgKiAoTWF0aC5zcXJ0KDMuMCkgLSAxLjApO1xuY29uc3QgRzIgPSAvKiNfX1BVUkVfXyovICgzLjAgLSBNYXRoLnNxcnQoMy4wKSkgLyA2LjA7XG5jb25zdCBGMyA9IDEuMCAvIDMuMDtcbmNvbnN0IEczID0gMS4wIC8gNi4wO1xuY29uc3QgRjQgPSAvKiNfX1BVUkVfXyovIChNYXRoLnNxcnQoNS4wKSAtIDEuMCkgLyA0LjA7XG5jb25zdCBHNCA9IC8qI19fUFVSRV9fKi8gKDUuMCAtIE1hdGguc3FydCg1LjApKSAvIDIwLjA7XG4vLyBJJ20gcmVhbGx5IG5vdCBzdXJlIHdoeSB0aGlzIHwgMCAoYmFzaWNhbGx5IGEgY29lcmNpb24gdG8gaW50KVxuLy8gaXMgbWFraW5nIHRoaXMgZmFzdGVyIGJ1dCBJIGdldCB+NSBtaWxsaW9uIG9wcy9zZWMgbW9yZSBvbiB0aGVcbi8vIGJlbmNobWFya3MgYWNyb3NzIHRoZSBib2FyZCBvciBhIH4xMCUgc3BlZWR1cC5cbmNvbnN0IGZhc3RGbG9vciA9ICh4KSA9PiBNYXRoLmZsb29yKHgpIHwgMDtcbmNvbnN0IGdyYWQyID0gLyojX19QVVJFX18qLyBuZXcgRmxvYXQ2NEFycmF5KFsxLCAxLFxuICAgIC0xLCAxLFxuICAgIDEsIC0xLFxuICAgIC0xLCAtMSxcbiAgICAxLCAwLFxuICAgIC0xLCAwLFxuICAgIDEsIDAsXG4gICAgLTEsIDAsXG4gICAgMCwgMSxcbiAgICAwLCAtMSxcbiAgICAwLCAxLFxuICAgIDAsIC0xXSk7XG4vLyBkb3VibGUgc2VlbXMgdG8gYmUgZmFzdGVyIHRoYW4gc2luZ2xlIG9yIGludCdzXG4vLyBwcm9iYWJseSBiZWNhdXNlIG1vc3Qgb3BlcmF0aW9ucyBhcmUgaW4gZG91YmxlIHByZWNpc2lvblxuY29uc3QgZ3JhZDMgPSAvKiNfX1BVUkVfXyovIG5ldyBGbG9hdDY0QXJyYXkoWzEsIDEsIDAsXG4gICAgLTEsIDEsIDAsXG4gICAgMSwgLTEsIDAsXG4gICAgLTEsIC0xLCAwLFxuICAgIDEsIDAsIDEsXG4gICAgLTEsIDAsIDEsXG4gICAgMSwgMCwgLTEsXG4gICAgLTEsIDAsIC0xLFxuICAgIDAsIDEsIDEsXG4gICAgMCwgLTEsIDEsXG4gICAgMCwgMSwgLTEsXG4gICAgMCwgLTEsIC0xXSk7XG4vLyBkb3VibGUgaXMgYSBiaXQgcXVpY2tlciBoZXJlIGFzIHdlbGxcbmNvbnN0IGdyYWQ0ID0gLyojX19QVVJFX18qLyBuZXcgRmxvYXQ2NEFycmF5KFswLCAxLCAxLCAxLCAwLCAxLCAxLCAtMSwgMCwgMSwgLTEsIDEsIDAsIDEsIC0xLCAtMSxcbiAgICAwLCAtMSwgMSwgMSwgMCwgLTEsIDEsIC0xLCAwLCAtMSwgLTEsIDEsIDAsIC0xLCAtMSwgLTEsXG4gICAgMSwgMCwgMSwgMSwgMSwgMCwgMSwgLTEsIDEsIDAsIC0xLCAxLCAxLCAwLCAtMSwgLTEsXG4gICAgLTEsIDAsIDEsIDEsIC0xLCAwLCAxLCAtMSwgLTEsIDAsIC0xLCAxLCAtMSwgMCwgLTEsIC0xLFxuICAgIDEsIDEsIDAsIDEsIDEsIDEsIDAsIC0xLCAxLCAtMSwgMCwgMSwgMSwgLTEsIDAsIC0xLFxuICAgIC0xLCAxLCAwLCAxLCAtMSwgMSwgMCwgLTEsIC0xLCAtMSwgMCwgMSwgLTEsIC0xLCAwLCAtMSxcbiAgICAxLCAxLCAxLCAwLCAxLCAxLCAtMSwgMCwgMSwgLTEsIDEsIDAsIDEsIC0xLCAtMSwgMCxcbiAgICAtMSwgMSwgMSwgMCwgLTEsIDEsIC0xLCAwLCAtMSwgLTEsIDEsIDAsIC0xLCAtMSwgLTEsIDBdKTtcbi8qKlxuICogQ3JlYXRlcyBhIDJEIG5vaXNlIGZ1bmN0aW9uXG4gKiBAcGFyYW0gcmFuZG9tIHRoZSByYW5kb20gZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gYnVpbGQgdGhlIHBlcm11dGF0aW9uIHRhYmxlXG4gKiBAcmV0dXJucyB7Tm9pc2VGdW5jdGlvbjJEfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTm9pc2UyRChyYW5kb20gPSBNYXRoLnJhbmRvbSkge1xuICAgIGNvbnN0IHBlcm0gPSBidWlsZFBlcm11dGF0aW9uVGFibGUocmFuZG9tKTtcbiAgICAvLyBwcmVjYWxjdWxhdGluZyB0aGlzIHlpZWxkcyBhIGxpdHRsZSB+MyUgcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQuXG4gICAgY29uc3QgcGVybUdyYWQyeCA9IG5ldyBGbG9hdDY0QXJyYXkocGVybSkubWFwKHYgPT4gZ3JhZDJbKHYgJSAxMikgKiAyXSk7XG4gICAgY29uc3QgcGVybUdyYWQyeSA9IG5ldyBGbG9hdDY0QXJyYXkocGVybSkubWFwKHYgPT4gZ3JhZDJbKHYgJSAxMikgKiAyICsgMV0pO1xuICAgIHJldHVybiBmdW5jdGlvbiBub2lzZTJEKHgsIHkpIHtcbiAgICAgICAgLy8gaWYoIWlzRmluaXRlKHgpIHx8ICFpc0Zpbml0ZSh5KSkgcmV0dXJuIDA7XG4gICAgICAgIGxldCBuMCA9IDA7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgdGhyZWUgY29ybmVyc1xuICAgICAgICBsZXQgbjEgPSAwO1xuICAgICAgICBsZXQgbjIgPSAwO1xuICAgICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICAgIGNvbnN0IHMgPSAoeCArIHkpICogRjI7IC8vIEhhaXJ5IGZhY3RvciBmb3IgMkRcbiAgICAgICAgY29uc3QgaSA9IGZhc3RGbG9vcih4ICsgcyk7XG4gICAgICAgIGNvbnN0IGogPSBmYXN0Rmxvb3IoeSArIHMpO1xuICAgICAgICBjb25zdCB0ID0gKGkgKyBqKSAqIEcyO1xuICAgICAgICBjb25zdCBYMCA9IGkgLSB0OyAvLyBVbnNrZXcgdGhlIGNlbGwgb3JpZ2luIGJhY2sgdG8gKHgseSkgc3BhY2VcbiAgICAgICAgY29uc3QgWTAgPSBqIC0gdDtcbiAgICAgICAgY29uc3QgeDAgPSB4IC0gWDA7IC8vIFRoZSB4LHkgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIGNvbnN0IHkwID0geSAtIFkwO1xuICAgICAgICAvLyBGb3IgdGhlIDJEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLlxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uXG4gICAgICAgIGxldCBpMSwgajE7IC8vIE9mZnNldHMgZm9yIHNlY29uZCAobWlkZGxlKSBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqKSBjb29yZHNcbiAgICAgICAgaWYgKHgwID4geTApIHtcbiAgICAgICAgICAgIGkxID0gMTtcbiAgICAgICAgICAgIGoxID0gMDtcbiAgICAgICAgfSAvLyBsb3dlciB0cmlhbmdsZSwgWFkgb3JkZXI6ICgwLDApLT4oMSwwKS0+KDEsMSlcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgICBqMSA9IDE7XG4gICAgICAgIH0gLy8gdXBwZXIgdHJpYW5nbGUsIFlYIG9yZGVyOiAoMCwwKS0+KDAsMSktPigxLDEpXG4gICAgICAgIC8vIEEgc3RlcCBvZiAoMSwwKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKDEtYywtYykgaW4gKHgseSksIGFuZFxuICAgICAgICAvLyBhIHN0ZXAgb2YgKDAsMSkgaW4gKGksaikgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMpIGluICh4LHkpLCB3aGVyZVxuICAgICAgICAvLyBjID0gKDMtc3FydCgzKSkvNlxuICAgICAgICBjb25zdCB4MSA9IHgwIC0gaTEgKyBHMjsgLy8gT2Zmc2V0cyBmb3IgbWlkZGxlIGNvcm5lciBpbiAoeCx5KSB1bnNrZXdlZCBjb29yZHNcbiAgICAgICAgY29uc3QgeTEgPSB5MCAtIGoxICsgRzI7XG4gICAgICAgIGNvbnN0IHgyID0geDAgLSAxLjAgKyAyLjAgKiBHMjsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzXG4gICAgICAgIGNvbnN0IHkyID0geTAgLSAxLjAgKyAyLjAgKiBHMjtcbiAgICAgICAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnNcbiAgICAgICAgY29uc3QgaWkgPSBpICYgMjU1O1xuICAgICAgICBjb25zdCBqaiA9IGogJiAyNTU7XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIHRocmVlIGNvcm5lcnNcbiAgICAgICAgbGV0IHQwID0gMC41IC0geDAgKiB4MCAtIHkwICogeTA7XG4gICAgICAgIGlmICh0MCA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBnaTAgPSBpaSArIHBlcm1bampdO1xuICAgICAgICAgICAgY29uc3QgZzB4ID0gcGVybUdyYWQyeFtnaTBdO1xuICAgICAgICAgICAgY29uc3QgZzB5ID0gcGVybUdyYWQyeVtnaTBdO1xuICAgICAgICAgICAgdDAgKj0gdDA7XG4gICAgICAgICAgICAvLyBuMCA9IHQwICogdDAgKiAoZ3JhZDJbZ2kwXSAqIHgwICsgZ3JhZDJbZ2kwICsgMV0gKiB5MCk7IC8vICh4LHkpIG9mIGdyYWQzIHVzZWQgZm9yIDJEIGdyYWRpZW50XG4gICAgICAgICAgICBuMCA9IHQwICogdDAgKiAoZzB4ICogeDAgKyBnMHkgKiB5MCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHQxID0gMC41IC0geDEgKiB4MSAtIHkxICogeTE7XG4gICAgICAgIGlmICh0MSA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBnaTEgPSBpaSArIGkxICsgcGVybVtqaiArIGoxXTtcbiAgICAgICAgICAgIGNvbnN0IGcxeCA9IHBlcm1HcmFkMnhbZ2kxXTtcbiAgICAgICAgICAgIGNvbnN0IGcxeSA9IHBlcm1HcmFkMnlbZ2kxXTtcbiAgICAgICAgICAgIHQxICo9IHQxO1xuICAgICAgICAgICAgLy8gbjEgPSB0MSAqIHQxICogKGdyYWQyW2dpMV0gKiB4MSArIGdyYWQyW2dpMSArIDFdICogeTEpO1xuICAgICAgICAgICAgbjEgPSB0MSAqIHQxICogKGcxeCAqIHgxICsgZzF5ICogeTEpO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0MiA9IDAuNSAtIHgyICogeDIgLSB5MiAqIHkyO1xuICAgICAgICBpZiAodDIgPj0gMCkge1xuICAgICAgICAgICAgY29uc3QgZ2kyID0gaWkgKyAxICsgcGVybVtqaiArIDFdO1xuICAgICAgICAgICAgY29uc3QgZzJ4ID0gcGVybUdyYWQyeFtnaTJdO1xuICAgICAgICAgICAgY29uc3QgZzJ5ID0gcGVybUdyYWQyeVtnaTJdO1xuICAgICAgICAgICAgdDIgKj0gdDI7XG4gICAgICAgICAgICAvLyBuMiA9IHQyICogdDIgKiAoZ3JhZDJbZ2kyXSAqIHgyICsgZ3JhZDJbZ2kyICsgMV0gKiB5Mik7XG4gICAgICAgICAgICBuMiA9IHQyICogdDIgKiAoZzJ4ICogeDIgKyBnMnkgKiB5Mik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIGNvbnRyaWJ1dGlvbnMgZnJvbSBlYWNoIGNvcm5lciB0byBnZXQgdGhlIGZpbmFsIG5vaXNlIHZhbHVlLlxuICAgICAgICAvLyBUaGUgcmVzdWx0IGlzIHNjYWxlZCB0byByZXR1cm4gdmFsdWVzIGluIHRoZSBpbnRlcnZhbCBbLTEsMV0uXG4gICAgICAgIHJldHVybiA3MC4wICogKG4wICsgbjEgKyBuMik7XG4gICAgfTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIDNEIG5vaXNlIGZ1bmN0aW9uXG4gKiBAcGFyYW0gcmFuZG9tIHRoZSByYW5kb20gZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gYnVpbGQgdGhlIHBlcm11dGF0aW9uIHRhYmxlXG4gKiBAcmV0dXJucyB7Tm9pc2VGdW5jdGlvbjNEfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTm9pc2UzRChyYW5kb20gPSBNYXRoLnJhbmRvbSkge1xuICAgIGNvbnN0IHBlcm0gPSBidWlsZFBlcm11dGF0aW9uVGFibGUocmFuZG9tKTtcbiAgICAvLyBwcmVjYWxjdWxhdGluZyB0aGVzZSBzZWVtcyB0byB5aWVsZCBhIHNwZWVkdXAgb2Ygb3ZlciAxNSVcbiAgICBjb25zdCBwZXJtR3JhZDN4ID0gbmV3IEZsb2F0NjRBcnJheShwZXJtKS5tYXAodiA9PiBncmFkM1sodiAlIDEyKSAqIDNdKTtcbiAgICBjb25zdCBwZXJtR3JhZDN5ID0gbmV3IEZsb2F0NjRBcnJheShwZXJtKS5tYXAodiA9PiBncmFkM1sodiAlIDEyKSAqIDMgKyAxXSk7XG4gICAgY29uc3QgcGVybUdyYWQzeiA9IG5ldyBGbG9hdDY0QXJyYXkocGVybSkubWFwKHYgPT4gZ3JhZDNbKHYgJSAxMikgKiAzICsgMl0pO1xuICAgIHJldHVybiBmdW5jdGlvbiBub2lzZTNEKHgsIHksIHopIHtcbiAgICAgICAgbGV0IG4wLCBuMSwgbjIsIG4zOyAvLyBOb2lzZSBjb250cmlidXRpb25zIGZyb20gdGhlIGZvdXIgY29ybmVyc1xuICAgICAgICAvLyBTa2V3IHRoZSBpbnB1dCBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggc2ltcGxleCBjZWxsIHdlJ3JlIGluXG4gICAgICAgIGNvbnN0IHMgPSAoeCArIHkgKyB6KSAqIEYzOyAvLyBWZXJ5IG5pY2UgYW5kIHNpbXBsZSBza2V3IGZhY3RvciBmb3IgM0RcbiAgICAgICAgY29uc3QgaSA9IGZhc3RGbG9vcih4ICsgcyk7XG4gICAgICAgIGNvbnN0IGogPSBmYXN0Rmxvb3IoeSArIHMpO1xuICAgICAgICBjb25zdCBrID0gZmFzdEZsb29yKHogKyBzKTtcbiAgICAgICAgY29uc3QgdCA9IChpICsgaiArIGspICogRzM7XG4gICAgICAgIGNvbnN0IFgwID0gaSAtIHQ7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5LHopIHNwYWNlXG4gICAgICAgIGNvbnN0IFkwID0gaiAtIHQ7XG4gICAgICAgIGNvbnN0IFowID0gayAtIHQ7XG4gICAgICAgIGNvbnN0IHgwID0geCAtIFgwOyAvLyBUaGUgeCx5LHogZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIGNvbnN0IHkwID0geSAtIFkwO1xuICAgICAgICBjb25zdCB6MCA9IHogLSBaMDtcbiAgICAgICAgLy8gRm9yIHRoZSAzRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhIHNsaWdodGx5IGlycmVndWxhciB0ZXRyYWhlZHJvbi5cbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLlxuICAgICAgICBsZXQgaTEsIGoxLCBrMTsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBvZiBzaW1wbGV4IGluIChpLGosaykgY29vcmRzXG4gICAgICAgIGxldCBpMiwgajIsIGsyOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqLGspIGNvb3Jkc1xuICAgICAgICBpZiAoeDAgPj0geTApIHtcbiAgICAgICAgICAgIGlmICh5MCA+PSB6MCkge1xuICAgICAgICAgICAgICAgIGkxID0gMTtcbiAgICAgICAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgICAgICAgazEgPSAwO1xuICAgICAgICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgICAgICAgazIgPSAwO1xuICAgICAgICAgICAgfSAvLyBYIFkgWiBvcmRlclxuICAgICAgICAgICAgZWxzZSBpZiAoeDAgPj0gejApIHtcbiAgICAgICAgICAgICAgICBpMSA9IDE7XG4gICAgICAgICAgICAgICAgajEgPSAwO1xuICAgICAgICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICAgICAgICBpMiA9IDE7XG4gICAgICAgICAgICAgICAgajIgPSAwO1xuICAgICAgICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgICAgIH0gLy8gWCBaIFkgb3JkZXJcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICAgICAgICBqMSA9IDA7XG4gICAgICAgICAgICAgICAgazEgPSAxO1xuICAgICAgICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICAgICAgICBqMiA9IDA7XG4gICAgICAgICAgICAgICAgazIgPSAxO1xuICAgICAgICAgICAgfSAvLyBaIFggWSBvcmRlclxuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyB4MDx5MFxuICAgICAgICAgICAgaWYgKHkwIDwgejApIHtcbiAgICAgICAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgICAgICAgajEgPSAwO1xuICAgICAgICAgICAgICAgIGsxID0gMTtcbiAgICAgICAgICAgICAgICBpMiA9IDA7XG4gICAgICAgICAgICAgICAgajIgPSAxO1xuICAgICAgICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgICAgIH0gLy8gWiBZIFggb3JkZXJcbiAgICAgICAgICAgIGVsc2UgaWYgKHgwIDwgejApIHtcbiAgICAgICAgICAgICAgICBpMSA9IDA7XG4gICAgICAgICAgICAgICAgajEgPSAxO1xuICAgICAgICAgICAgICAgIGsxID0gMDtcbiAgICAgICAgICAgICAgICBpMiA9IDA7XG4gICAgICAgICAgICAgICAgajIgPSAxO1xuICAgICAgICAgICAgICAgIGsyID0gMTtcbiAgICAgICAgICAgIH0gLy8gWSBaIFggb3JkZXJcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGkxID0gMDtcbiAgICAgICAgICAgICAgICBqMSA9IDE7XG4gICAgICAgICAgICAgICAgazEgPSAwO1xuICAgICAgICAgICAgICAgIGkyID0gMTtcbiAgICAgICAgICAgICAgICBqMiA9IDE7XG4gICAgICAgICAgICAgICAgazIgPSAwO1xuICAgICAgICAgICAgfSAvLyBZIFggWiBvcmRlclxuICAgICAgICB9XG4gICAgICAgIC8vIEEgc3RlcCBvZiAoMSwwLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgxLWMsLWMsLWMpIGluICh4LHkseiksXG4gICAgICAgIC8vIGEgc3RlcCBvZiAoMCwxLDApIGluIChpLGosaykgbWVhbnMgYSBzdGVwIG9mICgtYywxLWMsLWMpIGluICh4LHkseiksIGFuZFxuICAgICAgICAvLyBhIHN0ZXAgb2YgKDAsMCwxKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsLWMsMS1jKSBpbiAoeCx5LHopLCB3aGVyZVxuICAgICAgICAvLyBjID0gMS82LlxuICAgICAgICBjb25zdCB4MSA9IHgwIC0gaTEgKyBHMzsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHopIGNvb3Jkc1xuICAgICAgICBjb25zdCB5MSA9IHkwIC0gajEgKyBHMztcbiAgICAgICAgY29uc3QgejEgPSB6MCAtIGsxICsgRzM7XG4gICAgICAgIGNvbnN0IHgyID0geDAgLSBpMiArIDIuMCAqIEczOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6KSBjb29yZHNcbiAgICAgICAgY29uc3QgeTIgPSB5MCAtIGoyICsgMi4wICogRzM7XG4gICAgICAgIGNvbnN0IHoyID0gejAgLSBrMiArIDIuMCAqIEczO1xuICAgICAgICBjb25zdCB4MyA9IHgwIC0gMS4wICsgMy4wICogRzM7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseikgY29vcmRzXG4gICAgICAgIGNvbnN0IHkzID0geTAgLSAxLjAgKyAzLjAgKiBHMztcbiAgICAgICAgY29uc3QgejMgPSB6MCAtIDEuMCArIDMuMCAqIEczO1xuICAgICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZvdXIgc2ltcGxleCBjb3JuZXJzXG4gICAgICAgIGNvbnN0IGlpID0gaSAmIDI1NTtcbiAgICAgICAgY29uc3QgamogPSBqICYgMjU1O1xuICAgICAgICBjb25zdCBrayA9IGsgJiAyNTU7XG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgY29udHJpYnV0aW9uIGZyb20gdGhlIGZvdXIgY29ybmVyc1xuICAgICAgICBsZXQgdDAgPSAwLjYgLSB4MCAqIHgwIC0geTAgKiB5MCAtIHowICogejA7XG4gICAgICAgIGlmICh0MCA8IDApXG4gICAgICAgICAgICBuMCA9IDAuMDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBnaTAgPSBpaSArIHBlcm1bamogKyBwZXJtW2trXV07XG4gICAgICAgICAgICB0MCAqPSB0MDtcbiAgICAgICAgICAgIG4wID0gdDAgKiB0MCAqIChwZXJtR3JhZDN4W2dpMF0gKiB4MCArIHBlcm1HcmFkM3lbZ2kwXSAqIHkwICsgcGVybUdyYWQzeltnaTBdICogejApO1xuICAgICAgICB9XG4gICAgICAgIGxldCB0MSA9IDAuNiAtIHgxICogeDEgLSB5MSAqIHkxIC0gejEgKiB6MTtcbiAgICAgICAgaWYgKHQxIDwgMClcbiAgICAgICAgICAgIG4xID0gMC4wO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGdpMSA9IGlpICsgaTEgKyBwZXJtW2pqICsgajEgKyBwZXJtW2trICsgazFdXTtcbiAgICAgICAgICAgIHQxICo9IHQxO1xuICAgICAgICAgICAgbjEgPSB0MSAqIHQxICogKHBlcm1HcmFkM3hbZ2kxXSAqIHgxICsgcGVybUdyYWQzeVtnaTFdICogeTEgKyBwZXJtR3JhZDN6W2dpMV0gKiB6MSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHQyID0gMC42IC0geDIgKiB4MiAtIHkyICogeTIgLSB6MiAqIHoyO1xuICAgICAgICBpZiAodDIgPCAwKVxuICAgICAgICAgICAgbjIgPSAwLjA7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZ2kyID0gaWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMl1dO1xuICAgICAgICAgICAgdDIgKj0gdDI7XG4gICAgICAgICAgICBuMiA9IHQyICogdDIgKiAocGVybUdyYWQzeFtnaTJdICogeDIgKyBwZXJtR3JhZDN5W2dpMl0gKiB5MiArIHBlcm1HcmFkM3pbZ2kyXSAqIHoyKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdDMgPSAwLjYgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejM7XG4gICAgICAgIGlmICh0MyA8IDApXG4gICAgICAgICAgICBuMyA9IDAuMDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBnaTMgPSBpaSArIDEgKyBwZXJtW2pqICsgMSArIHBlcm1ba2sgKyAxXV07XG4gICAgICAgICAgICB0MyAqPSB0MztcbiAgICAgICAgICAgIG4zID0gdDMgKiB0MyAqIChwZXJtR3JhZDN4W2dpM10gKiB4MyArIHBlcm1HcmFkM3lbZ2kzXSAqIHkzICsgcGVybUdyYWQzeltnaTNdICogejMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS5cbiAgICAgICAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gc3RheSBqdXN0IGluc2lkZSBbLTEsMV1cbiAgICAgICAgcmV0dXJuIDMyLjAgKiAobjAgKyBuMSArIG4yICsgbjMpO1xuICAgIH07XG59XG4vKipcbiAqIENyZWF0ZXMgYSA0RCBub2lzZSBmdW5jdGlvblxuICogQHBhcmFtIHJhbmRvbSB0aGUgcmFuZG9tIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGJ1aWxkIHRoZSBwZXJtdXRhdGlvbiB0YWJsZVxuICogQHJldHVybnMge05vaXNlRnVuY3Rpb240RH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5vaXNlNEQocmFuZG9tID0gTWF0aC5yYW5kb20pIHtcbiAgICBjb25zdCBwZXJtID0gYnVpbGRQZXJtdXRhdGlvblRhYmxlKHJhbmRvbSk7XG4gICAgLy8gcHJlY2FsY3VsYXRpbmcgdGhlc2UgbGVhZHMgdG8gYSB+MTAlIHNwZWVkdXBcbiAgICBjb25zdCBwZXJtR3JhZDR4ID0gbmV3IEZsb2F0NjRBcnJheShwZXJtKS5tYXAodiA9PiBncmFkNFsodiAlIDMyKSAqIDRdKTtcbiAgICBjb25zdCBwZXJtR3JhZDR5ID0gbmV3IEZsb2F0NjRBcnJheShwZXJtKS5tYXAodiA9PiBncmFkNFsodiAlIDMyKSAqIDQgKyAxXSk7XG4gICAgY29uc3QgcGVybUdyYWQ0eiA9IG5ldyBGbG9hdDY0QXJyYXkocGVybSkubWFwKHYgPT4gZ3JhZDRbKHYgJSAzMikgKiA0ICsgMl0pO1xuICAgIGNvbnN0IHBlcm1HcmFkNHcgPSBuZXcgRmxvYXQ2NEFycmF5KHBlcm0pLm1hcCh2ID0+IGdyYWQ0Wyh2ICUgMzIpICogNCArIDNdKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gbm9pc2U0RCh4LCB5LCB6LCB3KSB7XG4gICAgICAgIGxldCBuMCwgbjEsIG4yLCBuMywgbjQ7IC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgZml2ZSBjb3JuZXJzXG4gICAgICAgIC8vIFNrZXcgdGhlICh4LHkseix3KSBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggY2VsbCBvZiAyNCBzaW1wbGljZXMgd2UncmUgaW5cbiAgICAgICAgY29uc3QgcyA9ICh4ICsgeSArIHogKyB3KSAqIEY0OyAvLyBGYWN0b3IgZm9yIDREIHNrZXdpbmdcbiAgICAgICAgY29uc3QgaSA9IGZhc3RGbG9vcih4ICsgcyk7XG4gICAgICAgIGNvbnN0IGogPSBmYXN0Rmxvb3IoeSArIHMpO1xuICAgICAgICBjb25zdCBrID0gZmFzdEZsb29yKHogKyBzKTtcbiAgICAgICAgY29uc3QgbCA9IGZhc3RGbG9vcih3ICsgcyk7XG4gICAgICAgIGNvbnN0IHQgPSAoaSArIGogKyBrICsgbCkgKiBHNDsgLy8gRmFjdG9yIGZvciA0RCB1bnNrZXdpbmdcbiAgICAgICAgY29uc3QgWDAgPSBpIC0gdDsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseix3KSBzcGFjZVxuICAgICAgICBjb25zdCBZMCA9IGogLSB0O1xuICAgICAgICBjb25zdCBaMCA9IGsgLSB0O1xuICAgICAgICBjb25zdCBXMCA9IGwgLSB0O1xuICAgICAgICBjb25zdCB4MCA9IHggLSBYMDsgLy8gVGhlIHgseSx6LHcgZGlzdGFuY2VzIGZyb20gdGhlIGNlbGwgb3JpZ2luXG4gICAgICAgIGNvbnN0IHkwID0geSAtIFkwO1xuICAgICAgICBjb25zdCB6MCA9IHogLSBaMDtcbiAgICAgICAgY29uc3QgdzAgPSB3IC0gVzA7XG4gICAgICAgIC8vIEZvciB0aGUgNEQgY2FzZSwgdGhlIHNpbXBsZXggaXMgYSA0RCBzaGFwZSBJIHdvbid0IGV2ZW4gdHJ5IHRvIGRlc2NyaWJlLlxuICAgICAgICAvLyBUbyBmaW5kIG91dCB3aGljaCBvZiB0aGUgMjQgcG9zc2libGUgc2ltcGxpY2VzIHdlJ3JlIGluLCB3ZSBuZWVkIHRvXG4gICAgICAgIC8vIGRldGVybWluZSB0aGUgbWFnbml0dWRlIG9yZGVyaW5nIG9mIHgwLCB5MCwgejAgYW5kIHcwLlxuICAgICAgICAvLyBTaXggcGFpci13aXNlIGNvbXBhcmlzb25zIGFyZSBwZXJmb3JtZWQgYmV0d2VlbiBlYWNoIHBvc3NpYmxlIHBhaXJcbiAgICAgICAgLy8gb2YgdGhlIGZvdXIgY29vcmRpbmF0ZXMsIGFuZCB0aGUgcmVzdWx0cyBhcmUgdXNlZCB0byByYW5rIHRoZSBudW1iZXJzLlxuICAgICAgICBsZXQgcmFua3ggPSAwO1xuICAgICAgICBsZXQgcmFua3kgPSAwO1xuICAgICAgICBsZXQgcmFua3ogPSAwO1xuICAgICAgICBsZXQgcmFua3cgPSAwO1xuICAgICAgICBpZiAoeDAgPiB5MClcbiAgICAgICAgICAgIHJhbmt4Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt5Kys7XG4gICAgICAgIGlmICh4MCA+IHowKVxuICAgICAgICAgICAgcmFua3grKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3orKztcbiAgICAgICAgaWYgKHgwID4gdzApXG4gICAgICAgICAgICByYW5reCsrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5rdysrO1xuICAgICAgICBpZiAoeTAgPiB6MClcbiAgICAgICAgICAgIHJhbmt5Kys7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhbmt6Kys7XG4gICAgICAgIGlmICh5MCA+IHcwKVxuICAgICAgICAgICAgcmFua3krKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmFua3crKztcbiAgICAgICAgaWYgKHowID4gdzApXG4gICAgICAgICAgICByYW5reisrO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByYW5rdysrO1xuICAgICAgICAvLyBzaW1wbGV4W2NdIGlzIGEgNC12ZWN0b3Igd2l0aCB0aGUgbnVtYmVycyAwLCAxLCAyIGFuZCAzIGluIHNvbWUgb3JkZXIuXG4gICAgICAgIC8vIE1hbnkgdmFsdWVzIG9mIGMgd2lsbCBuZXZlciBvY2N1ciwgc2luY2UgZS5nLiB4Pnk+ej53IG1ha2VzIHg8eiwgeTx3IGFuZCB4PHdcbiAgICAgICAgLy8gaW1wb3NzaWJsZS4gT25seSB0aGUgMjQgaW5kaWNlcyB3aGljaCBoYXZlIG5vbi16ZXJvIGVudHJpZXMgbWFrZSBhbnkgc2Vuc2UuXG4gICAgICAgIC8vIFdlIHVzZSBhIHRocmVzaG9sZGluZyB0byBzZXQgdGhlIGNvb3JkaW5hdGVzIGluIHR1cm4gZnJvbSB0aGUgbGFyZ2VzdCBtYWduaXR1ZGUuXG4gICAgICAgIC8vIFJhbmsgMyBkZW5vdGVzIHRoZSBsYXJnZXN0IGNvb3JkaW5hdGUuXG4gICAgICAgIC8vIFJhbmsgMiBkZW5vdGVzIHRoZSBzZWNvbmQgbGFyZ2VzdCBjb29yZGluYXRlLlxuICAgICAgICAvLyBSYW5rIDEgZGVub3RlcyB0aGUgc2Vjb25kIHNtYWxsZXN0IGNvb3JkaW5hdGUuXG4gICAgICAgIC8vIFRoZSBpbnRlZ2VyIG9mZnNldHMgZm9yIHRoZSBzZWNvbmQgc2ltcGxleCBjb3JuZXJcbiAgICAgICAgY29uc3QgaTEgPSByYW5reCA+PSAzID8gMSA6IDA7XG4gICAgICAgIGNvbnN0IGoxID0gcmFua3kgPj0gMyA/IDEgOiAwO1xuICAgICAgICBjb25zdCBrMSA9IHJhbmt6ID49IDMgPyAxIDogMDtcbiAgICAgICAgY29uc3QgbDEgPSByYW5rdyA+PSAzID8gMSA6IDA7XG4gICAgICAgIC8vIFRoZSBpbnRlZ2VyIG9mZnNldHMgZm9yIHRoZSB0aGlyZCBzaW1wbGV4IGNvcm5lclxuICAgICAgICBjb25zdCBpMiA9IHJhbmt4ID49IDIgPyAxIDogMDtcbiAgICAgICAgY29uc3QgajIgPSByYW5reSA+PSAyID8gMSA6IDA7XG4gICAgICAgIGNvbnN0IGsyID0gcmFua3ogPj0gMiA/IDEgOiAwO1xuICAgICAgICBjb25zdCBsMiA9IHJhbmt3ID49IDIgPyAxIDogMDtcbiAgICAgICAgLy8gVGhlIGludGVnZXIgb2Zmc2V0cyBmb3IgdGhlIGZvdXJ0aCBzaW1wbGV4IGNvcm5lclxuICAgICAgICBjb25zdCBpMyA9IHJhbmt4ID49IDEgPyAxIDogMDtcbiAgICAgICAgY29uc3QgajMgPSByYW5reSA+PSAxID8gMSA6IDA7XG4gICAgICAgIGNvbnN0IGszID0gcmFua3ogPj0gMSA/IDEgOiAwO1xuICAgICAgICBjb25zdCBsMyA9IHJhbmt3ID49IDEgPyAxIDogMDtcbiAgICAgICAgLy8gVGhlIGZpZnRoIGNvcm5lciBoYXMgYWxsIGNvb3JkaW5hdGUgb2Zmc2V0cyA9IDEsIHNvIG5vIG5lZWQgdG8gY29tcHV0ZSB0aGF0LlxuICAgICAgICBjb25zdCB4MSA9IHgwIC0gaTEgKyBHNDsgLy8gT2Zmc2V0cyBmb3Igc2Vjb25kIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIGNvbnN0IHkxID0geTAgLSBqMSArIEc0O1xuICAgICAgICBjb25zdCB6MSA9IHowIC0gazEgKyBHNDtcbiAgICAgICAgY29uc3QgdzEgPSB3MCAtIGwxICsgRzQ7XG4gICAgICAgIGNvbnN0IHgyID0geDAgLSBpMiArIDIuMCAqIEc0OyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICBjb25zdCB5MiA9IHkwIC0gajIgKyAyLjAgKiBHNDtcbiAgICAgICAgY29uc3QgejIgPSB6MCAtIGsyICsgMi4wICogRzQ7XG4gICAgICAgIGNvbnN0IHcyID0gdzAgLSBsMiArIDIuMCAqIEc0O1xuICAgICAgICBjb25zdCB4MyA9IHgwIC0gaTMgKyAzLjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgZm91cnRoIGNvcm5lciBpbiAoeCx5LHosdykgY29vcmRzXG4gICAgICAgIGNvbnN0IHkzID0geTAgLSBqMyArIDMuMCAqIEc0O1xuICAgICAgICBjb25zdCB6MyA9IHowIC0gazMgKyAzLjAgKiBHNDtcbiAgICAgICAgY29uc3QgdzMgPSB3MCAtIGwzICsgMy4wICogRzQ7XG4gICAgICAgIGNvbnN0IHg0ID0geDAgLSAxLjAgKyA0LjAgKiBHNDsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSx6LHcpIGNvb3Jkc1xuICAgICAgICBjb25zdCB5NCA9IHkwIC0gMS4wICsgNC4wICogRzQ7XG4gICAgICAgIGNvbnN0IHo0ID0gejAgLSAxLjAgKyA0LjAgKiBHNDtcbiAgICAgICAgY29uc3QgdzQgPSB3MCAtIDEuMCArIDQuMCAqIEc0O1xuICAgICAgICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZpdmUgc2ltcGxleCBjb3JuZXJzXG4gICAgICAgIGNvbnN0IGlpID0gaSAmIDI1NTtcbiAgICAgICAgY29uc3QgamogPSBqICYgMjU1O1xuICAgICAgICBjb25zdCBrayA9IGsgJiAyNTU7XG4gICAgICAgIGNvbnN0IGxsID0gbCAmIDI1NTtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZml2ZSBjb3JuZXJzXG4gICAgICAgIGxldCB0MCA9IDAuNiAtIHgwICogeDAgLSB5MCAqIHkwIC0gejAgKiB6MCAtIHcwICogdzA7XG4gICAgICAgIGlmICh0MCA8IDApXG4gICAgICAgICAgICBuMCA9IDAuMDtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBnaTAgPSBpaSArIHBlcm1bamogKyBwZXJtW2trICsgcGVybVtsbF1dXTtcbiAgICAgICAgICAgIHQwICo9IHQwO1xuICAgICAgICAgICAgbjAgPSB0MCAqIHQwICogKHBlcm1HcmFkNHhbZ2kwXSAqIHgwICsgcGVybUdyYWQ0eVtnaTBdICogeTAgKyBwZXJtR3JhZDR6W2dpMF0gKiB6MCArIHBlcm1HcmFkNHdbZ2kwXSAqIHcwKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdDEgPSAwLjYgLSB4MSAqIHgxIC0geTEgKiB5MSAtIHoxICogejEgLSB3MSAqIHcxO1xuICAgICAgICBpZiAodDEgPCAwKVxuICAgICAgICAgICAgbjEgPSAwLjA7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZ2kxID0gaWkgKyBpMSArIHBlcm1bamogKyBqMSArIHBlcm1ba2sgKyBrMSArIHBlcm1bbGwgKyBsMV1dXTtcbiAgICAgICAgICAgIHQxICo9IHQxO1xuICAgICAgICAgICAgbjEgPSB0MSAqIHQxICogKHBlcm1HcmFkNHhbZ2kxXSAqIHgxICsgcGVybUdyYWQ0eVtnaTFdICogeTEgKyBwZXJtR3JhZDR6W2dpMV0gKiB6MSArIHBlcm1HcmFkNHdbZ2kxXSAqIHcxKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdDIgPSAwLjYgLSB4MiAqIHgyIC0geTIgKiB5MiAtIHoyICogejIgLSB3MiAqIHcyO1xuICAgICAgICBpZiAodDIgPCAwKVxuICAgICAgICAgICAgbjIgPSAwLjA7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZ2kyID0gaWkgKyBpMiArIHBlcm1bamogKyBqMiArIHBlcm1ba2sgKyBrMiArIHBlcm1bbGwgKyBsMl1dXTtcbiAgICAgICAgICAgIHQyICo9IHQyO1xuICAgICAgICAgICAgbjIgPSB0MiAqIHQyICogKHBlcm1HcmFkNHhbZ2kyXSAqIHgyICsgcGVybUdyYWQ0eVtnaTJdICogeTIgKyBwZXJtR3JhZDR6W2dpMl0gKiB6MiArIHBlcm1HcmFkNHdbZ2kyXSAqIHcyKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdDMgPSAwLjYgLSB4MyAqIHgzIC0geTMgKiB5MyAtIHozICogejMgLSB3MyAqIHczO1xuICAgICAgICBpZiAodDMgPCAwKVxuICAgICAgICAgICAgbjMgPSAwLjA7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZ2kzID0gaWkgKyBpMyArIHBlcm1bamogKyBqMyArIHBlcm1ba2sgKyBrMyArIHBlcm1bbGwgKyBsM11dXTtcbiAgICAgICAgICAgIHQzICo9IHQzO1xuICAgICAgICAgICAgbjMgPSB0MyAqIHQzICogKHBlcm1HcmFkNHhbZ2kzXSAqIHgzICsgcGVybUdyYWQ0eVtnaTNdICogeTMgKyBwZXJtR3JhZDR6W2dpM10gKiB6MyArIHBlcm1HcmFkNHdbZ2kzXSAqIHczKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgdDQgPSAwLjYgLSB4NCAqIHg0IC0geTQgKiB5NCAtIHo0ICogejQgLSB3NCAqIHc0O1xuICAgICAgICBpZiAodDQgPCAwKVxuICAgICAgICAgICAgbjQgPSAwLjA7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZ2k0ID0gaWkgKyAxICsgcGVybVtqaiArIDEgKyBwZXJtW2trICsgMSArIHBlcm1bbGwgKyAxXV1dO1xuICAgICAgICAgICAgdDQgKj0gdDQ7XG4gICAgICAgICAgICBuNCA9IHQ0ICogdDQgKiAocGVybUdyYWQ0eFtnaTRdICogeDQgKyBwZXJtR3JhZDR5W2dpNF0gKiB5NCArIHBlcm1HcmFkNHpbZ2k0XSAqIHo0ICsgcGVybUdyYWQ0d1tnaTRdICogdzQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFN1bSB1cCBhbmQgc2NhbGUgdGhlIHJlc3VsdCB0byBjb3ZlciB0aGUgcmFuZ2UgWy0xLDFdXG4gICAgICAgIHJldHVybiAyNy4wICogKG4wICsgbjEgKyBuMiArIG4zICsgbjQpO1xuICAgIH07XG59XG4vKipcbiAqIEJ1aWxkcyBhIHJhbmRvbSBwZXJtdXRhdGlvbiB0YWJsZS5cbiAqIFRoaXMgaXMgZXhwb3J0ZWQgb25seSBmb3IgKGludGVybmFsKSB0ZXN0aW5nIHB1cnBvc2VzLlxuICogRG8gbm90IHJlbHkgb24gdGhpcyBleHBvcnQuXG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQZXJtdXRhdGlvblRhYmxlKHJhbmRvbSkge1xuICAgIGNvbnN0IHRhYmxlU2l6ZSA9IDUxMjtcbiAgICBjb25zdCBwID0gbmV3IFVpbnQ4QXJyYXkodGFibGVTaXplKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhYmxlU2l6ZSAvIDI7IGkrKykge1xuICAgICAgICBwW2ldID0gaTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YWJsZVNpemUgLyAyIC0gMTsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHIgPSBpICsgfn4ocmFuZG9tKCkgKiAoMjU2IC0gaSkpO1xuICAgICAgICBjb25zdCBhdXggPSBwW2ldO1xuICAgICAgICBwW2ldID0gcFtyXTtcbiAgICAgICAgcFtyXSA9IGF1eDtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDI1NjsgaSA8IHRhYmxlU2l6ZTsgaSsrKSB7XG4gICAgICAgIHBbaV0gPSBwW2kgLSAyNTZdO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNpbXBsZXgtbm9pc2UuanMubWFwIiwiZnVuY3Rpb24gYXJlQ29sbGluZGluZyhwMSwgcDIsIHAzLCBwNCkge1xuICAgIHZhciBkZXQsIGdhbW1hLCBsYW1iZGFcbiAgICBkZXQgPSAocDJbMF0gLSBwMVswXSkgKiAocDRbMV0gLSBwM1sxXSkgLSAocDRbMF0gLSBwM1swXSkgKiAocDJbMV0gLSBwMVsxXSlcbiAgICBpZiAoZGV0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGxhbWJkYSA9XG4gICAgICAgICAgICAoKHA0WzFdIC0gcDNbMV0pICogKHA0WzBdIC0gcDFbMF0pICtcbiAgICAgICAgICAgICAgICAocDNbMF0gLSBwNFswXSkgKiAocDRbMV0gLSBwMVsxXSkpIC9cbiAgICAgICAgICAgIGRldFxuICAgICAgICBnYW1tYSA9XG4gICAgICAgICAgICAoKHAxWzFdIC0gcDJbMV0pICogKHA0WzBdIC0gcDFbMF0pICtcbiAgICAgICAgICAgICAgICAocDJbMF0gLSBwMVswXSkgKiAocDRbMV0gLSBwMVsxXSkpIC9cbiAgICAgICAgICAgIGRldFxuICAgICAgICByZXR1cm4gMCA8IGxhbWJkYSAmJiBsYW1iZGEgPCAxICYmIDAgPCBnYW1tYSAmJiBnYW1tYSA8IDFcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldExpbmVMaW5lQ29sbGlzaW9uKHAxLCBwMiwgcDMsIHA0KSB7XG4gICAgaWYgKCFhcmVDb2xsaW5kaW5nKHAxLCBwMiwgcDMsIHA0KSkgcmV0dXJuIGZhbHNlXG5cbiAgICBjb25zdCB1YSA9XG4gICAgICAgICgocDRbMF0gLSBwM1swXSkgKiAocDFbMV0gLSBwM1sxXSkgLVxuICAgICAgICAgICAgKHA0WzFdIC0gcDNbMV0pICogKHAxWzBdIC0gcDNbMF0pKSAvXG4gICAgICAgICgocDRbMV0gLSBwM1sxXSkgKiAocDJbMF0gLSBwMVswXSkgLSAocDRbMF0gLSBwM1swXSkgKiAocDJbMV0gLSBwMVsxXSkpXG5cbiAgICBjb25zdCB4ID0gcDFbMF0gKyB1YSAqIChwMlswXSAtIHAxWzBdKVxuICAgIGNvbnN0IHkgPSBwMVsxXSArIHVhICogKHAyWzFdIC0gcDFbMV0pXG5cbiAgICByZXR1cm4gW3gsIHldXG59XG5cbmV4cG9ydCB7IGdldExpbmVMaW5lQ29sbGlzaW9uIH1cbiIsIi8qKlxuICogRGV0ZXJtaW5lIGlmIHBvaW50IGlzIGluIHBvbHlcbiAqIEBwYXJhbSB7b2JqZWN0fSBwIHRoZSBbeCx5XSBwb3NpdGlvbiBvZiB0aGUgcG9pbnRcbiAqIEBwYXJhbSB7YXJyYXl9IHBvbHlnb24gYSBsaXN0IG9mIHBvbHlnb24gcG9pbnRzXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHBvaW50LCB2cykge1xuICAgIC8vIHJheS1jYXN0aW5nIGFsZ29yaXRobSBiYXNlZCBvblxuICAgIC8vIGh0dHBzOi8vd3JmLmVjc2UucnBpLmVkdS9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbC9wbnBvbHkuaHRtbFxuXG4gICAgdmFyIHggPSBwb2ludFswXSxcbiAgICAgICAgeSA9IHBvaW50WzFdXG5cbiAgICB2YXIgaW5zaWRlID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZzLmxlbmd0aCAtIDE7IGkgPCB2cy5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgICAgdmFyIHhpID0gdnNbaV1bMF0sXG4gICAgICAgICAgICB5aSA9IHZzW2ldWzFdXG4gICAgICAgIHZhciB4aiA9IHZzW2pdWzBdLFxuICAgICAgICAgICAgeWogPSB2c1tqXVsxXVxuXG4gICAgICAgIHZhciBpbnRlcnNlY3QgPVxuICAgICAgICAgICAgeWkgPiB5ICE9IHlqID4geSAmJiB4IDwgKCh4aiAtIHhpKSAqICh5IC0geWkpKSAvICh5aiAtIHlpKSArIHhpXG4gICAgICAgIGlmIChpbnRlcnNlY3QpIGluc2lkZSA9ICFpbnNpZGVcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zaWRlXG59XG4iLCIvKipcbiAqIENyZWF0ZSBkYXNoIGFsb25nIGEgbGluZVxuICogQHBhcmFtIHtBcnJheX0gbGluZSBbW3gxLCB5MV0sIFt4MiwgeTJdXVxuICogQHBhcmFtIHtOdW1iZXJ9IHN0ZXAgbWF4aW11bSBkYXNoIGxlbmd0aFxuICogQHBhcmFtIHtOdW1iZXJ9IG1vZGUgMDogc3RyYWlnaHQgMTogcmFuZG9tXG4gKlxuICogQHJldHVybnMge0FycmF5fSBvZiBtdWx0aXBsZSBsaW5lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChsaW5lLCBzdGVwLCBtb2RlKSB7XG4gICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGxpbmVbMV1bMV0gLSBsaW5lWzBdWzFdLCBsaW5lWzFdWzBdIC0gbGluZVswXVswXSlcbiAgICBjb25zdCBzaXplID0gTWF0aC5zcXJ0KFxuICAgICAgICBNYXRoLmFicyhsaW5lWzFdWzBdIC0gbGluZVswXVswXSkgKiogMiArXG4gICAgICAgICAgICBNYXRoLmFicyhsaW5lWzFdWzFdIC0gbGluZVswXVsxXSkgKiogMlxuICAgIClcblxuICAgIGxldCByID0gMCxcbiAgICAgICAgcHJldiA9IGxpbmVbMF1cbiAgICBjb25zdCBkYXNoTGluZSA9IFtdXG5cbiAgICB3aGlsZSAociA8IHNpemUpIHtcbiAgICAgICAgLy8gcmFuZG9tIGxpbmUgbGVuZ3RoXG4gICAgICAgIGxldCBsaW5lTGVuZ3RoID0gc3RlcCAqIChtb2RlID09PSAwID8gMC4xNSA6IDAuMyAqIE1hdGgucmFuZG9tKCkpXG5cbiAgICAgICAgLy8gbGluZUxlbmdodCB0b28gbG9uZ1xuICAgICAgICBpZiAociArIGxpbmVMZW5ndGggPiBzaXplKSBsaW5lTGVuZ3RoID0gc2l6ZSAtIHJcblxuICAgICAgICBjb25zdCBuZXh0ID0gW1xuICAgICAgICAgICAgcHJldlswXSArIE1hdGguY29zKGFuZ2xlKSAqIGxpbmVMZW5ndGgsXG4gICAgICAgICAgICBwcmV2WzFdICsgTWF0aC5zaW4oYW5nbGUpICogbGluZUxlbmd0aFxuICAgICAgICBdXG4gICAgICAgIGRhc2hMaW5lLnB1c2goW1twcmV2LCBuZXh0XV0pXG5cbiAgICAgICAgLy8gbGl0dGxlIGp1bXAgYmV0d2VlbiBsaW5lc1xuICAgICAgICBjb25zdCBqdW1wTGVuZ2h0ID0gc3RlcCAqIChtb2RlID09PSAwID8gMC4xNSA6IDAuMTUgKiBNYXRoLnJhbmRvbSgpKVxuICAgICAgICBwcmV2ID0gWy4uLm5leHRdXG4gICAgICAgIHByZXZbMF0gKz0gTWF0aC5jb3MoYW5nbGUpICoganVtcExlbmdodFxuICAgICAgICBwcmV2WzFdICs9IE1hdGguc2luKGFuZ2xlKSAqIGp1bXBMZW5naHRcbiAgICAgICAgciArPSBqdW1wTGVuZ2h0ICsgbGluZUxlbmd0aFxuICAgIH1cbiAgICByZXR1cm4gZGFzaExpbmVcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcnQge1xuICAgIGNvbnN0cnVjdG9yKHBvaW50cywgaW5kZXgpIHtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBwb2ludHNcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4XG4gICAgfVxufVxuIiwiaW1wb3J0IFN2Z1RyYWNlciBmcm9tICcuLi8uLi9za2V0Y2gtY29tbW9uL3N2Zy10cmFjZXInXG5pbXBvcnQgeyBjcmVhdGVOb2lzZTJEIH0gZnJvbSAnc2ltcGxleC1ub2lzZSdcbmltcG9ydCB7IGdldExpbmVMaW5lQ29sbGlzaW9uIH0gZnJvbSAnLi90cmlnb25vbWV0cnknXG5pbXBvcnQgaXNQb2ludEluc2lkZVBvbHlnb24gZnJvbSAnLi9pc1BvaW50SW5zaWRlUG9seWdvbidcbmltcG9ydCBkYXNoTGluZSBmcm9tICcuL2Rhc2hMaW5lJ1xuaW1wb3J0IFBhcnQgZnJvbSAnLi9QYXJ0J1xuXG5sZXQgbWFyZ2luLCBwYXJ0cywgdGlsZVNpemVcbmNvbnN0IHN2ZyA9IG5ldyBTdmdUcmFjZXIoe1xuICAgIHBhcmVudEVsZW06IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd3aW5kb3dGcmFtZScpLFxuICAgIHNpemU6ICdBM19zcXVhcmUnLFxuICAgIGRwaTogNzJcbn0pLFxuICAgIHNpbXBsZXggPSBjcmVhdGVOb2lzZTJEKCksXG4gICAgTiA9IE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogMyksXG4gICAgSSA9IDQ4LFxuICAgIGxpbmVTdGVwID0gNixcbiAgICBub2lzZUxpbmUgPSAobGluZSkgPT4ge1xuICAgICAgICBjb25zdCBub2lzZWRMaW5lID0gW11cbiAgICAgICAgY29uc3QgZnJlcSA9IDAuMDAzXG4gICAgICAgIGNvbnN0IHR1cmJ1bGVuY2UgPSAxNVxuICAgICAgICBjb25zdCBmb3JjZSA9IDJcbiAgICAgICAgbGluZS5mb3JFYWNoKChwdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgblZhbHVlID1cbiAgICAgICAgICAgICAgICB0dXJidWxlbmNlICogc2ltcGxleChwdFswXSAqIGZyZXEsIHB0WzFdICogZnJlcSlcbiAgICAgICAgICAgIG5vaXNlZExpbmUucHVzaChbXG4gICAgICAgICAgICAgICAgcHRbMF0gKyBNYXRoLmNvcyhuVmFsdWUpICogZm9yY2UsXG4gICAgICAgICAgICAgICAgcHRbMV0gKyBNYXRoLnNpbihuVmFsdWUpICogZm9yY2VcbiAgICAgICAgICAgIF0pXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiBub2lzZWRMaW5lXG4gICAgfVxuXG5jb25zdCBza2V0Y2ggPSB7XG4gICAgLy8gc2V0dXBcbiAgICBsYXVuY2g6ICgpID0+IHtcbiAgICAgICAgc3ZnLmluaXQoKVxuICAgICAgICBtYXJnaW4gPSBzdmcuY21Ub1BpeGVscygzKVxuICAgICAgICB0aWxlU2l6ZSA9IFtcbiAgICAgICAgICAgIE1hdGgucm91bmQoKHN2Zy53aWR0aCAtIG1hcmdpbiAqIDIpIC8gTiksXG4gICAgICAgICAgICBNYXRoLnJvdW5kKChzdmcuaGVpZ2h0IC0gbWFyZ2luICogMikgLyBOKVxuICAgICAgICBdXG4gICAgICAgIHNrZXRjaC5pbml0KClcbiAgICB9LFxuICAgIC8vIHJlc2V0IHZhbHVlIGFuZCByZWxhdW5jaCBkcmF3aW5nXG4gICAgaW5pdDogKCkgPT4ge1xuICAgICAgICBzdmcuY2xlYXIoKVxuICAgICAgICBwYXJ0cyA9IFtdXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgTjsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IE47IHkrKykge1xuICAgICAgICAgICAgICAgIHBhcnRzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQYXJ0KFxuICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luICsgeCAqIHRpbGVTaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4gKyB5ICogdGlsZVNpemVbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luICsgKHggKyAxKSAqIHRpbGVTaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4gKyB5ICogdGlsZVNpemVbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luICsgKHggKyAxKSAqIHRpbGVTaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4gKyAoeSArIDEpICogdGlsZVNpemVbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luICsgeCAqIHRpbGVTaXplWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4gKyAoeSArIDEpICogdGlsZVNpemVbMV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgKHggKyB5KSAlIDJcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsZXQgaSA9IDBcbiAgICAgICAgd2hpbGUgKGkgPCBJKSB7XG4gICAgICAgICAgICBza2V0Y2guY3V0VGlsZSgpXG4gICAgICAgICAgICBpKytcbiAgICAgICAgfVxuICAgICAgICBza2V0Y2guZHJhd1RpbGVzKClcbiAgICB9LFxuICAgIGN1dFRpbGU6ICgpID0+IHtcbiAgICAgICAgY29uc3QgaXNWZXJ0aWNhbCA9IE1hdGgucmFuZG9tKCkgPiAwLjVcbiAgICAgICAgY29uc3QgbGluZSA9IFtcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsID8gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogc3ZnLndpZHRoKSA6IG1hcmdpbiAvIDIsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbCA/IG1hcmdpbiAvIDIgOiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBzdmcuaGVpZ2h0KVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBpc1ZlcnRpY2FsXG4gICAgICAgICAgICAgICAgICAgID8gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogc3ZnLndpZHRoKVxuICAgICAgICAgICAgICAgICAgICA6IHN2Zy53aWR0aCAtIG1hcmdpbiAvIDIsXG4gICAgICAgICAgICAgICAgaXNWZXJ0aWNhbFxuICAgICAgICAgICAgICAgICAgICA/IHN2Zy5oZWlnaHQgLSBtYXJnaW4gLyAyXG4gICAgICAgICAgICAgICAgICAgIDogTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogc3ZnLmhlaWdodClcbiAgICAgICAgICAgIF1cbiAgICAgICAgXVxuXG4gICAgICAgIGxldCBuZXdQYXJ0cyA9IFtdXG4gICAgICAgIGxldCBwYXJ0c1RvUmVtb3ZlID0gW11cbiAgICAgICAgcGFydHMuZm9yRWFjaCgocGFydCwgaCkgPT4ge1xuICAgICAgICAgICAgbGV0IHNwbGl0ID0gW11cbiAgICAgICAgICAgIGxldCBpbnRlcnNlY3QgPSBbdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gICAgICAgICAgICBwYXJ0LnBvaW50cy5mb3JFYWNoKChwdCwgaSwgcG9pbnRzKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgblB0ID0gZ2V0TGluZUxpbmVDb2xsaXNpb24oXG4gICAgICAgICAgICAgICAgICAgIHB0LFxuICAgICAgICAgICAgICAgICAgICBwb2ludHNbaSA8IHBvaW50cy5sZW5ndGggLSAxID8gaSArIDEgOiAwXSxcbiAgICAgICAgICAgICAgICAgICAgbGluZVswXSxcbiAgICAgICAgICAgICAgICAgICAgbGluZVsxXVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBpZiAoblB0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZpcnN0IGNvbGxpc2lvblxuICAgICAgICAgICAgICAgICAgICBpZiAodW5kZWZpbmVkID09IGludGVyc2VjdFswXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BsaXQucHVzaChuUHQpXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnNlY3RbMF0gPSBpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlY29uZCBjb2xsaXNpb25cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwbGl0LnB1c2goblB0KVxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJzZWN0WzFdID0gaVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgYiA9IFtdXG4gICAgICAgICAgICAgICAgcGFydC5wb2ludHMuZm9yRWFjaCgocHQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPD0gaW50ZXJzZWN0WzBdKSBhLnB1c2gocHQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBpbnRlcnNlY3RbMF0gKyAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLnB1c2goc3BsaXRbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBiLnB1c2goc3BsaXRbMF0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPiBpbnRlcnNlY3RbMF0gJiYgaSA8PSBpbnRlcnNlY3RbMV0pIGIucHVzaChwdClcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGludGVyc2VjdFsxXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYi5wdXNoKHNwbGl0WzFdKVxuICAgICAgICAgICAgICAgICAgICAgICAgYS5wdXNoKHNwbGl0WzFdKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID4gaW50ZXJzZWN0WzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLnB1c2gocHQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIG5ld1BhcnRzLnB1c2gobmV3IFBhcnQoYSwgcGFydC5pbmRleCArIDEpKVxuICAgICAgICAgICAgICAgIG5ld1BhcnRzLnB1c2gobmV3IFBhcnQoYiwgcGFydC5pbmRleCArIDIpKVxuICAgICAgICAgICAgICAgIHBhcnRzVG9SZW1vdmUucHVzaChoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBpZiAodW5kZWZpbmVkICE9PSBuZXdQYXJ0c1swXSAmJiB1bmRlZmluZWQgIT09IHBhcnRzVG9SZW1vdmVbMF0pIHtcbiAgICAgICAgICAgIGNvbnN0IG5leHRQYXJ0cyA9IHBhcnRzLmZpbHRlcigocGFydCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAhcGFydHNUb1JlbW92ZS5pbmNsdWRlcyhpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIG5ld1BhcnRzLmZvckVhY2goKHApID0+IG5leHRQYXJ0cy5wdXNoKHApKVxuICAgICAgICAgICAgcGFydHMgPSBuZXh0UGFydHNcbiAgICAgICAgICAgIHN2Zy5jbGVhcigpXG4gICAgICAgICAgICBza2V0Y2guZHJhd1RpbGVzKClcbiAgICAgICAgfVxuICAgIH0sXG4gICAgZHJhd1RpbGVzOiAoKSA9PiB7XG4gICAgICAgIHN2Zy5jbGVhcigpXG4gICAgICAgIHBhcnRzLmZvckVhY2goKHAsIGkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1pbiA9IFtcbiAgICAgICAgICAgICAgICBNYXRoLm1pbiguLi5wLnBvaW50cy5tYXAoKHB0KSA9PiBwdFswXSkpLFxuICAgICAgICAgICAgICAgIE1hdGgubWluKC4uLnAucG9pbnRzLm1hcCgocHQpID0+IHB0WzFdKSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGNvbnN0IG1heCA9IFtcbiAgICAgICAgICAgICAgICBNYXRoLm1heCguLi5wLnBvaW50cy5tYXAoKHB0KSA9PiBwdFswXSkpLFxuICAgICAgICAgICAgICAgIE1hdGgubWF4KC4uLnAucG9pbnRzLm1hcCgocHQpID0+IHB0WzFdKSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLnNxcnQoXG4gICAgICAgICAgICAgICAgTWF0aC5hYnMobWF4WzBdIC0gbWluWzBdKSAqKiAyICsgTWF0aC5hYnMobWF4WzFdIC0gbWluWzFdKSAqKiAyXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IFtdXG4gICAgICAgICAgICBpZiAoaSAlIDIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB4ID0gbWluWzBdOyB4IDw9IG1heFswXTsgeCArPSBsaW5lU3RlcCkge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFt4LCBtaW5bMV1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgW3gsIG1heFsxXV1cbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHkgPSBtaW5bMV07IHkgPD0gbWF4WzFdOyB5ICs9IGxpbmVTdGVwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICAgICAgW21pblswXSwgeV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbbWF4WzBdLCB5XVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxpbmVTdHlsZSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpXG4gICAgICAgICAgICBsaW5lcy5mb3JFYWNoKChsKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKGxbMV1bMV0gLSBsWzBdWzFdLCBsWzFdWzBdIC0gbFswXVswXSlcblxuICAgICAgICAgICAgICAgIGxldCBsYXN0UG9pbnRJblBvbHkgPSBmYWxzZVxuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVQb2x5ID0gW11cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBkID0gMDsgZCA8PSBzaXplOyBkKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHQgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBsWzBdWzBdICsgZCAqIE1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxbMF1bMV0gKyBkICogTWF0aC5zaW4oYW5nbGUpXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNQb2ludEluUG9seSA9IGlzUG9pbnRJbnNpZGVQb2x5Z29uKHB0LCBwLnBvaW50cylcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUG9pbnRJblBvbHkgIT09IGxhc3RQb2ludEluUG9seSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZVBvbHkucHVzaChwdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lUG9seS5sZW5ndGggPT0gMikgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQb2ludEluUG9seSA9IGlzUG9pbnRJblBvbHlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobGluZVBvbHkubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChsaW5lU3R5bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRhc2ggbm9pc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXNoTGluZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1suLi5saW5lUG9seVswXV0sIFsuLi5saW5lUG9seVsxXV1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcC5pbmRleCAlIDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLmZvckVhY2goKGwpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5wYXRoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50czogWy4uLmxdLm1hcCgocHQpID0+IG5vaXNlTGluZShwdCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmdWxsIG5vaXNlXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnBhdGgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHM6IG5vaXNlTGluZShsaW5lUG9seSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZTogJ2JsYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bmlmb3JtIGRhc2ggc3RyYWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXNoTGluZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1suLi5saW5lUG9seVswXV0sIFsuLi5saW5lUG9seVsxXV1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkuZm9yRWFjaCgobCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnBhdGgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzOiBbLi4ubF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZTogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJhbmRvbSBkYXNoIHN0cmFpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFzaExpbmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtbLi4ubGluZVBvbHlbMF1dLCBbLi4ubGluZVBvbHlbMV1dXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLmZvckVhY2goKGwpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5wYXRoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50czogWy4uLmxdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2U6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbXB0eVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJhaWdodCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnBhdGgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHM6IGxpbmVQb2x5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICAvLyBleHBvcnQgaW5saW5lIDxzdmc+IGFzIFNWRyBmaWxlXG4gICAgZXhwb3J0OiAoKSA9PiB7XG4gICAgICAgIHN2Zy5leHBvcnQoeyBuYW1lOiAnZnJhZ21lbnRhdGlvbicgfSlcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNrZXRjaFxuIiwiY29uc3QgaW5mb2JveCA9ICgpID0+IHtcblxuICAgIGNvbnN0IGluZm9Cb3hFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm9ib3gnKTtcblxuICAgIGlmIChpbmZvQm94RWxlbWVudCAhPSBudWxsKSB7XG4gICAgICAgIGluZm9Cb3hFbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpXG4gICAgfVxuXG59XG5leHBvcnQgZGVmYXVsdCBpbmZvYm94IiwiY29uc3QgY2hhcnMgPSBbLi4uJzAxMjM0NTY3ODknLCAuLi4nOi8qfCYjQCQhPD4nLCAuLi4ne31bXSstX15+JT87KCknXVxuY29uc3QgZHVyYXRpb24gPSA0NVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbGl0Y2hUZXh0IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wZXJ0eSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBwcm9wZXJ0eS5lbGVtZW50XG4gICAgICAgIHRoaXMudHJ1ZVRleHQgPSBwcm9wZXJ0eS5lbGVtZW50LmlubmVyVGV4dCB8fCBwcm9wZXJ0eS5lbGVtZW50LmlubmVySFRNTFxuICAgICAgICB0aGlzLm51bUNoYXIgPSB0aGlzLnRydWVUZXh0Lmxlbmd0aFxuICAgICAgICB0aGlzLmVmZmVjdCA9IHByb3BlcnR5LmVmZmVjdFxuICAgICAgICB0aGlzLmN1ckNoYXIgPSAwXG4gICAgICAgIHRoaXMuYml0ZUNoYXIgPSAnJ1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5udW1DaGFyOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBjaGFyQXRJID0gdGhpcy50cnVlVGV4dC5zdWJzdHIoaSwgMSlcbiAgICAgICAgICAgIGlmIChjaGFyQXRJICYmIGNoYXJBdEkgPT09ICcgJykge1xuICAgICAgICAgICAgICAgIHRoaXMuYml0ZUNoYXIgKz0gJyAnXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYml0ZUNoYXIgKz0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcnMubGVuZ3RoKV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gdGhpcy5lZmZlY3QgPT0gJ3JlcGxhY2UnID8gdGhpcy5iaXRlQ2hhciA6ICcnXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDw9IHRoaXMubnVtQ2hhcjsgeCsrKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lZmZlY3QgPT09ICdhZGQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hhcigpXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmVmZmVjdCA9PT0gJ3JlcGxhY2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZUNoYXIoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHggKiBkdXJhdGlvbilcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXBsYWNlQ2hhcigpIHtcbiAgICAgICAgbGV0IG1pZGRsZVN0cmluZ1BhcnRcbiAgICAgICAgaWYgKHRoaXMuY3VyQ2hhciArIDEgPCB0aGlzLm51bUNoYXIpIHtcbiAgICAgICAgICAgIG1pZGRsZVN0cmluZ1BhcnQgPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWlkZGxlU3RyaW5nUGFydCA9ICcnXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpcnN0U3RyaW5nUGFydCA9IHRoaXMudHJ1ZVRleHQuc3Vic3RyKDAsIHRoaXMuY3VyQ2hhcilcbiAgICAgICAgbGV0IGxhc3RTdHJpbmdQYXJ0ID0gdGhpcy5iaXRlQ2hhci5zdWJzdHIodGhpcy5jdXJDaGFyLCB0aGlzLm51bUNoYXIpXG4gICAgICAgIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPVxuICAgICAgICAgICAgZmlyc3RTdHJpbmdQYXJ0ICsgbWlkZGxlU3RyaW5nUGFydCArIGxhc3RTdHJpbmdQYXJ0XG4gICAgICAgIHRoaXMuZWxlbWVudC5kYXRhc2V0LnRleHQgPVxuICAgICAgICAgICAgZmlyc3RTdHJpbmdQYXJ0ICsgbWlkZGxlU3RyaW5nUGFydCArIGxhc3RTdHJpbmdQYXJ0XG4gICAgICAgIHRoaXMuY3VyQ2hhcisrXG4gICAgfVxuICAgIGFkZENoYXIoKSB7XG4gICAgICAgIGxldCBtaWRkbGVTdHJpbmdQYXJ0XG4gICAgICAgIGlmICh0aGlzLmN1ckNoYXIgKyAxIDwgdGhpcy5udW1DaGFyKSB7XG4gICAgICAgICAgICBtaWRkbGVTdHJpbmdQYXJ0ID0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcnMubGVuZ3RoKV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1pZGRsZVN0cmluZ1BhcnQgPSAnJ1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZpcnN0U3RyaW5nUGFydCA9IHRoaXMudHJ1ZVRleHQuc3Vic3RyKDAsIHRoaXMuY3VyQ2hhcilcbiAgICAgICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9IGZpcnN0U3RyaW5nUGFydCArIG1pZGRsZVN0cmluZ1BhcnRcbiAgICAgICAgdGhpcy5lbGVtZW50LmRhdGFzZXQudGV4dCA9IGZpcnN0U3RyaW5nUGFydCArIG1pZGRsZVN0cmluZ1BhcnRcbiAgICAgICAgdGhpcy5jdXJDaGFyKytcbiAgICB9XG59XG4iLCJpbXBvcnQgR2xpdGNoVGV4dCBmcm9tICcuL2dsaXRjaFRleHQnXG5cbmNvbnN0IGhhbmRsZUFjdGlvbiA9ICgpID0+IHtcbiAgICB3aW5kb3dbJ29wZW5PZmZGcmFtZSddID0gKCkgPT4ge1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoJ29wZW5lZE9mZldpbmRvdycpXG4gICAgICAgIGNvbnN0IHRpdGxlRWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9qZWN0VGl0bGUnKVxuICAgICAgICBuZXcgR2xpdGNoVGV4dCh7XG4gICAgICAgICAgICBlbGVtZW50OiB0aXRsZUVsZW0sXG4gICAgICAgICAgICBlZmZlY3Q6ICdhZGQnXG4gICAgICAgIH0pXG4gICAgfVxuICAgIGNvbnN0IGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb25dJylcblxuICAgIGlmICh0eXBlb2YgYnV0dG9ucyAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICBmb3IgKGxldCBiID0gMDsgYiA8IGJ1dHRvbnMubGVuZ3RoOyBiKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvbiA9IGJ1dHRvbnNbYl0uZ2V0QXR0cmlidXRlKCdkYXRhLWFjdGlvbicpXG4gICAgICAgICAgICBidXR0b25zW2JdLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgJ2NsaWNrJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbGxlZEZ1bmN0aW9uID0gd2luZG93W2FjdGlvbl1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsZWRGdW5jdGlvbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYWN0aW9uLCAnIGlzIG5vdCBkZWZpbmVkJylcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxlZEZ1bmN0aW9uKClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgaGFuZGxlQWN0aW9uXG4iLCJpbXBvcnQgJy4uL2ZyYW1lZC1jYW52YXMuY3NzJ1xuaW1wb3J0IHNrZXRjaCBmcm9tICcuL3NrZXRjaCdcbmltcG9ydCBpbmZvYm94IGZyb20gJy4uLy4uL3NrZXRjaC1jb21tb24vaW5mb2JveCdcbmltcG9ydCBoYW5kbGVBY3Rpb24gZnJvbSAnLi4vLi4vc2tldGNoLWNvbW1vbi9oYW5kbGUtYWN0aW9uJ1xuXG5jb25zdCBjb250YWluZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3dpbmRvd0ZyYW1lJylcbmNvbnN0IGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkaW5nJylcblxuc2tldGNoLmxhdW5jaCgpXG5jb250YWluZXJFbGVtZW50LnJlbW92ZUNoaWxkKGxvYWRlcilcbndpbmRvdy5pbml0ID0gc2tldGNoLmluaXRcbndpbmRvdy5leHBvcnQgPSBza2V0Y2guZXhwb3J0XG53aW5kb3cuZm9sZCA9IHNrZXRjaC5jdXRUaWxlXG53aW5kb3cuaW5mb2JveCA9IGluZm9ib3hcbmhhbmRsZUFjdGlvbigpXG4iXSwibmFtZXMiOlsiU3ZnVHJhY2VyIiwib3B0aW9ucyIsIl9jbGFzc0NhbGxDaGVjayIsInBhcmVudEVsZW0iLCJkcGkiLCJ1bmRlZmluZWQiLCJiYWNrZ3JvdW5kIiwicHJpbnRGb3JtYXQiLCJBM19sYW5kc2NhcGUiLCJ3IiwiaCIsIkEzX3BvcnRyYWl0IiwiQTNfc3F1YXJlIiwiQTNfdG9wU3BpcmFsTm90ZWJvb2siLCJBNF9sYW5kc2NhcGUiLCJBNF9wb3J0cmFpdCIsIlAzMngyNCIsIlAyNHgzMiIsImRwaVRvUGl4IiwibmFtZXNwYWNlIiwiaW5rc2NhcGUiLCJzdmciLCJncm91cHMiLCJzaXplIiwid2lkdGgiLCJoZWlnaHQiLCJjb25jYXQiLCJwcmludFNpemUiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImVycm9yIiwiX2NyZWF0ZUNsYXNzIiwia2V5IiwidmFsdWUiLCJpbml0IiwiZWxlbSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwic2V0QXR0cmlidXRlIiwic3R5bGUiLCJhc3BlY3RSYXRpbyIsImFwcGVuZENoaWxkIiwicmVjdCIsIngiLCJ5IiwiZmlsbCIsImNsZWFyIiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwiY2xlYXJHcm91cHMiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJncm91cF9uYW1lIiwiaW5jbHVkZXMiLCJhcHBlbmRUb0dyb3VwIiwiZ3JvdXAiLCJzdmdJdGVtIiwicmVjdFByb3BzIiwic3Ryb2tlIiwiY2lyY2xlIiwiY2lyY2xlUHJvcHMiLCJyIiwidHJpYW5nbGUiLCJ0cmlhbmdsZVByb3BzIiwicG9pbnRzIiwiY2xvc2UiLCJuYW1lIiwicGF0aCIsInBhdGhQcm9wcyIsInN0cm9rZVdpZHRoIiwiTnVtYmVyIiwic2V0QXR0ciIsImQiLCJpIiwidGV4dCIsInRleHRQcm9wcyIsImZvbnRGYW1pbHkiLCJmb250U2l6ZSIsImFuY2hvciIsImlubmVySFRNTCIsImdyb3VwUHJvcHMiLCJpZCIsImdyb3VwRWxlbSIsInNldEF0dHJpYnV0ZU5TIiwiX2V4cG9ydCIsImV4cG9ydE9wdGlvbnMiLCJzdmdGaWxlIiwiZGF0ZSIsIkRhdGUiLCJZIiwiZ2V0RnVsbFllYXIiLCJtIiwiZ2V0TW9udGgiLCJnZXREYXkiLCJIIiwiZ2V0SG91cnMiLCJnZXRNaW51dGVzIiwiZmlsZW5hbWUiLCJzdmdNYXJrdXAiLCJvdXRlckhUTUwiLCJkYXRhIiwiQmxvYiIsInR5cGUiLCJ3aW5kb3ciLCJVUkwiLCJyZXZva2VPYmplY3RVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJsaW5rIiwiY3JlYXRlRWxlbWVudCIsImhyZWYiLCJkb3dubG9hZCIsImNsaWNrIiwiY21Ub1BpeGVscyIsImNtIiwiaXNOYU4iLCJjb25zdCIsImxldCIsImFyZUNvbGxpbmRpbmciLCJwMSIsInAyIiwicDMiLCJwNCIsImRldCIsImdhbW1hIiwibGFtYmRhIiwiZ2V0TGluZUxpbmVDb2xsaXNpb24iLCJ1YSIsInBvaW50IiwidnMiLCJpbnNpZGUiLCJqIiwieGkiLCJ5aSIsInhqIiwieWoiLCJpbnRlcnNlY3QiLCJsaW5lIiwic3RlcCIsIm1vZGUiLCJhbmdsZSIsIk1hdGgiLCJhdGFuMiIsInNxcnQiLCJwb3ciLCJhYnMiLCJwcmV2IiwiZGFzaExpbmUiLCJsaW5lTGVuZ3RoIiwicmFuZG9tIiwibmV4dCIsImNvcyIsInNpbiIsInB1c2giLCJqdW1wTGVuZ2h0IiwiUGFydCIsImluZGV4IiwibWFyZ2luIiwicGFydHMiLCJ0aWxlU2l6ZSIsImdldEVsZW1lbnRCeUlkIiwic2ltcGxleCIsImNyZWF0ZU5vaXNlMkQiLCJOIiwiY2VpbCIsIkkiLCJsaW5lU3RlcCIsIm5vaXNlTGluZSIsIm5vaXNlZExpbmUiLCJmcmVxIiwidHVyYnVsZW5jZSIsImZvcmNlIiwiZm9yRWFjaCIsInB0IiwiblZhbHVlIiwic2tldGNoIiwibGF1bmNoIiwicm91bmQiLCJjdXRUaWxlIiwiZHJhd1RpbGVzIiwiaXNWZXJ0aWNhbCIsIm5ld1BhcnRzIiwicGFydHNUb1JlbW92ZSIsInBhcnQiLCJzcGxpdCIsIm5QdCIsImEiLCJiIiwibmV4dFBhcnRzIiwiZmlsdGVyIiwicCIsIm1pbiIsImFwcGx5IiwiX3RvQ29uc3VtYWJsZUFycmF5IiwibWFwIiwibWF4IiwibGluZXMiLCJsaW5lU3R5bGUiLCJmbG9vciIsImwiLCJsYXN0UG9pbnRJblBvbHkiLCJsaW5lUG9seSIsImlzUG9pbnRJblBvbHkiLCJpc1BvaW50SW5zaWRlUG9seWdvbiIsImluZm9ib3giLCJpbmZvQm94RWxlbWVudCIsImNsYXNzTGlzdCIsInRvZ2dsZSIsImNoYXJzIiwiZHVyYXRpb24iLCJHbGl0Y2hUZXh0IiwicHJvcGVydHkiLCJfdGhpcyIsImVsZW1lbnQiLCJ0cnVlVGV4dCIsImlubmVyVGV4dCIsIm51bUNoYXIiLCJlZmZlY3QiLCJjdXJDaGFyIiwiYml0ZUNoYXIiLCJjaGFyQXRJIiwic3Vic3RyIiwic2V0VGltZW91dCIsImFkZENoYXIiLCJyZXBsYWNlQ2hhciIsIm1pZGRsZVN0cmluZ1BhcnQiLCJmaXJzdFN0cmluZ1BhcnQiLCJsYXN0U3RyaW5nUGFydCIsImRhdGFzZXQiLCJoYW5kbGVBY3Rpb24iLCJib2R5IiwidGl0bGVFbGVtIiwiYnV0dG9ucyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJfbG9vcCIsImFjdGlvbiIsImdldEF0dHJpYnV0ZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJjYWxsZWRGdW5jdGlvbiIsImNvbnRhaW5lckVsZW1lbnQiLCJsb2FkZXIiLCJmb2xkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUFBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBVEEsSUFXcUJBLFNBQVMsZ0JBQUEsWUFBQTtFQUMxQjtFQUNKO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7SUFDSSxTQUFBQSxTQUFBQSxDQUFZQyxPQUFPLEVBQUU7RUFBQUMsSUFBQUEsZUFBQSxPQUFBRixTQUFBLENBQUEsQ0FBQTtFQUNqQixJQUFBLElBQUksQ0FBQ0csVUFBVSxHQUFHRixPQUFPLENBQUNFLFVBQVUsQ0FBQTtFQUNwQyxJ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QUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0VBQ3REQSxJQUFNLEVBQUUsR0FBaUIsQ0FBQSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQztFQUt0RDtFQUNBO0VBQ0E7RUFDQUEsSUFBTSxTQUFTLEdBQUcsVUFBQyxDQUFDLEVBQUssRUFBQSxPQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBQyxDQUFDO0VBQzNDQSxJQUFNLEtBQUssaUJBQWlCLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7RUFDbEQsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0VBQ1QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ1QsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDVixJQUFJLENBQUMsRUFBRSxDQUFDO0VBQ1IsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0VBQ1QsSUFBSSxDQUFDLEVBQUUsQ0FBQztFQUNSLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztFQUNULElBQUksQ0FBQyxFQUFFLENBQUM7RUFDUixJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDVCxJQUFJLENBQUMsRUFBRSxDQUFDO0VBQ1IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBd0JaO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDTyxTQUFTLGFBQWEsQ0FBQyxNQUFvQixFQUFFO0VBQWhCLElBQUEsS0FBQSxNQUFBLEtBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxHQUFHLElBQUksQ0FBQyxNQUFBLENBQUE7QUFBUztFQUNyRCxJQUFJQSxJQUFNLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUMvQztFQUNBLElBQUlBLElBQU0sVUFBVSxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQSxVQUFDLEdB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SCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDOUIsQ0FBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUtHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBR0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQ3JDSSxHQUFHLENBQUE7RUFDUCxJQUFBLE9BQU8sQ0FBQyxHQUFHRSxNQUFNLElBQUlBLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHRCxLQUFLLElBQUlBLEtBQUssR0FBRyxDQUFDLENBQUE7RUFDN0QsR0FBQTtFQUNKLENBQUE7RUFFQSxTQUFTRSxvQkFBb0JBLENBQUNQLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRTtFQUMxQyxFQUFBLElBQUksQ0FBQ0osYUFBYSxDQUFDQyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFLENBQUMsRUFBRSxFQUFBLE9BQU8sS0FBSyxDQUFBLEVBQUE7RUFFaEQsRUFBQSxJQUFNSyxFQUFFLEdBQ0osQ0FBQyxDQUFDTCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUdELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBS0YsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDOUIsQ0FBQ0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUtGLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBR0UsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQ3BDLENBQUNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBR0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUdELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUNHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBR0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLRCxFQUFFLENBQUMsQ0FB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
