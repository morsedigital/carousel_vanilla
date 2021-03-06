"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");
var ViewportDetect = require("viewport-detection-es6");
var viewport = new ViewportDetect();

var CarouselClass = function () {
  function CarouselClass() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var init = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    _classCallCheck(this, CarouselClass);

    this.config = _.defaults(config, { itemClass: "carousel-item", autoPlay: false });

    if (init) {
      this._initViewport();
      this._init();
    }
  }

  _createClass(CarouselClass, [{
    key: "render",
    value: function render() {
      this._getItems();
      this._setDefaultSelected();
    }
  }, {
    key: "_addDotClickListeners",
    value: function _addDotClickListeners() {
      _.forEach(this.dots, function (dot) {
        dot.addEventListener("click", this._dotClick.bind(this), false);
      }.bind(this));
    }
  }, {
    key: "_addFocusListeners",
    value: function _addFocusListeners() {
      this.config.element.addEventListener("mouseenter", this._stopAutoPlay.bind(this), false);
      this.config.element.addEventListener("mouseleave", this._restartTimer.bind(this), false);
    }
  }, {
    key: "_addNextListener",
    value: function _addNextListener() {
      this.nextButton.addEventListener("click", this._next.bind(this), false);
    }
  }, {
    key: "_addPreviousListener",
    value: function _addPreviousListener() {
      this.previousButton.addEventListener("click", this._previous.bind(this), false);
    }
  }, {
    key: "_animateItemFinish",
    value: function _animateItemFinish(e) {
      var _this = this;

      var item = e.target;

      _.defer(function () {
        _this.animating = false;
      });

      item.className = item.className.replace(/(?:^|\s)animating(?!\S)/g, "");
    }
  }, {
    key: "_animateItemStart",
    value: function _animateItemStart(item, st, end) {
      var _this2 = this;

      item.style.left = st;

      _.delay(function () {
        _this2.animating = true;
        item.style.left = end;
        item.className += " animating";
      }, 100);

      this.eventManager.addListener(item, "transitionend", this._animateItemFinish.bind(this));
    }
  }, {
    key: "_checkDataURLs",
    value: function _checkDataURLs() {
      var dataURLs = undefined,
          imageContainer = undefined,
          dataURLMobile = undefined,
          dataURLTablet = undefined,
          dataURLDesktop = undefined;

      _.forEach(this.items, function (item) {
        var _this3 = this;

        imageContainer = this._skipTextNodes(item, "firstChild");
        dataURLMobile = imageContainer.getAttribute("data-mobile");
        dataURLTablet = imageContainer.getAttribute("data-tablet");
        dataURLDesktop = imageContainer.getAttribute("data-desktop");
        dataURLs = [{ mobile: dataURLMobile }, { tablet: dataURLTablet }, { desktop: dataURLDesktop }];

        _.forEach(dataURLs, function (dataURL) {
          _.map(dataURL, function (v, k) {
            if (_.isEmpty(v) || _.isNull(v) || _.includes(v, "null")) {
              _this3._overrideNullDataURLs(k, dataURLDesktop, imageContainer);
            }
          });
        });

        this.hasDataURLs = true;
        this._setBackgroundImages(this.device);
      }.bind(this));
    }
  }, {
    key: "_createArrowNav",
    value: function _createArrowNav(direction, parent) {
      var a = undefined,
          span = undefined,
          svg = undefined;

      a = document.createElement("a");
      span = document.createElement("span");

      a.id = "carousel-" + direction;
      a.setAttribute("href", "#");

      if (direction === "previous") {
        span.innerHTML = "Previous";
        a.appendChild(span);
        svg = this._createArrowNavSvg(direction);
        a.appendChild(svg);
        this.previousButton = a;
        this._addPreviousListener();
      } else {
        span.innerHTML = "Next";
        a.appendChild(span);
        svg = this._createArrowNavSvg(direction);
        a.appendChild(svg);
        this.nextButton = a;
        this._addNextListener();
      }

      parent.appendChild(a);
    }
  }, {
    key: "_createArrowNavContainer",
    value: function _createArrowNavContainer() {
      var li = undefined,
          ul = undefined;

      ul = document.createElement("ul");
      ul.className = "carousel-arrows-container";

      _.times(2, function (i) {
        li = document.createElement("li");

        li.className = i === 0 ? "previous" : "next";
        this._createArrowNav(i === 0 ? "previous" : "next", li);

        ul.appendChild(li);
      }.bind(this));

      this.config.element.appendChild(ul);
    }
  }, {
    key: "_createArrowNavSvg",
    value: function _createArrowNavSvg(direction) {
      var pathA = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var pathB = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

      svg.setAttribute("fill", "#4a4a4a");
      svg.setAttribute("height", "48");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("width", "48");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

      if (direction === "next") {
        pathA.setAttributeNS(null, "d", "M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z");
        pathB.setAttributeNS(null, "d", "M0-.25h24v24H0z");
      } else {
        pathA.setAttributeNS(null, "d", "M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z");
        pathB.setAttributeNS(null, "d", "M0-.5h24v24H0z");
      }

      pathB.setAttribute("fill", "none");

      svg.appendChild(pathA);
      svg.appendChild(pathB);

      return svg;
    }
  }, {
    key: "_createDotsNav",
    value: function _createDotsNav() {
      var a = undefined,
          li = undefined;
      var ul = this.dotsContainer.getElementsByTagName("ul")[0];

      _.forEach(this.items, function (item, i) {
        a = document.createElement("a");
        li = document.createElement("li");

        a.setAttribute("href", "#");

        li.appendChild(a);
        ul.appendChild(li);
      }.bind(this));

      this._getDots();
    }
  }, {
    key: "_createDotsNavContainer",
    value: function _createDotsNavContainer() {
      var div = document.createElement("div");
      var ul = document.createElement("ul");
      this.dotsContainer = document.createElement("div");

      div.className = "carousel-dots";
      this.dotsContainer.id = "carousel-dots-container";

      div.appendChild(ul);
      this.dotsContainer.appendChild(div);
      this.config.element.appendChild(this.dotsContainer);

      this._createDotsNav();
    }
  }, {
    key: "_dotClick",
    value: function _dotClick(e) {
      var index = _.indexOf(this.dots, e.target);

      if (!this.animating) {
        if (this.itemActive !== index) {
          this.itemOut = this.itemActive;
          this.itemActive = index;

          this._setDotClass(e.target);
          this._setSelected("next");
        }
      }

      e.preventDefault();
    }
  }, {
    key: "_getDots",
    value: function _getDots() {
      this.dots = this.dotsContainer.getElementsByTagName("a");

      this._addDotClickListeners();
      this._setDotClass(this.dots[this.itemActive]);
    }
  }, {
    key: "_getItems",
    value: function _getItems() {
      this.items = this.config.element.querySelectorAll("." + this.config.itemClass);

      if (this.items.length > 1) {
        this._createArrowNavContainer();
        this._createDotsNavContainer();
      }

      this._checkDataURLs();
    }
  }, {
    key: "_init",
    value: function _init() {
      this.animating = false;
      this.eventManager = this._manageListeners();
      this.hasDataURLs = false;
      this.itemActive = 0;
      this.items = [];
      this.render();
    }
  }, {
    key: "_initViewport",
    value: function _initViewport() {
      this.device = viewport.getDevice();
      this.size = viewport.windowSize();
      viewport.trackSize(this._trackSize.bind(this));
    }
  }, {
    key: "_manageListeners",
    value: function _manageListeners() {
      var listenerArray = [];

      return {
        addListener: function addListener(target, event, fn) {
          listenerArray.push({
            target: target,
            event: event,
            fn: fn
          });

          target.addEventListener(event, fn, false);
        },

        removeAll: function removeAll() {
          if (listenerArray.length > 0) {
            _.forEach(listenerArray, function (cur) {
              cur.target.removeEventListener(cur.event, cur.fn, false);
              cur.target.className.replace(/(?:^|\s)animating(?!\S)/g, "");
            });

            listenerArray = [];
          }
        }
      };
    }
  }, {
    key: "_next",
    value: function _next(e) {
      if (!this.animating) {
        this.itemOut = this.itemActive;

        if (this.itemActive < this.items.length - 1) {
          this.itemActive++;
        } else {
          this.itemActive = 0;
        }

        this._setSelected("next");
      }

      e.preventDefault();
    }
  }, {
    key: "_overrideNullDataURLs",
    value: function _overrideNullDataURLs(breakpoint, dataURLDesktop, imageContainer) {
      imageContainer.setAttribute("data-" + breakpoint, dataURLDesktop);
    }
  }, {
    key: "_previous",
    value: function _previous(e) {
      if (!this.animating) {
        this.itemOut = this.itemActive;

        if (this.itemActive > 0) {
          this.itemActive--;
        } else {
          this.itemActive = this.items.length - 1;
        }

        this._setSelected("previous");
      }

      e.preventDefault();
    }
  }, {
    key: "_restartTimer",
    value: function _restartTimer() {
      if (!this.animating || this.items.length < 2) {
        this._stopAutoPlay();
        this.timer = window.setInterval(this._startAutoPlay.bind(this), 5000);
      }
    }
  }, {
    key: "_setBackgroundImages",
    value: function _setBackgroundImages(device) {
      _.forEach(this.items, function (item) {
        var imageContainer = this._skipTextNodes(item, "firstChild");

        var url = imageContainer.getAttribute("data-" + device);

        imageContainer.style.backgroundImage = "url(" + url + ")";
      }.bind(this));
    }
  }, {
    key: "_setDefaultSelected",
    value: function _setDefaultSelected() {
      var items = _.difference(this.items, [this.items[this.itemActive]]);
      var windowWidth = this.config.element.clientWidth;

      this.items[this.itemActive].style.left = 0;

      if (items.length > 0) {
        _.forEach(items, function (item) {
          item.style.left = windowWidth + "px";
        });
      }

      if (this.config.autoPlay) {
        this._addFocusListeners();
        this._restartTimer();
      }
    }
  }, {
    key: "_setDotClass",
    value: function _setDotClass(clickedDot) {
      _.forEach(this.dots, function (dot) {
        var className = dot.className;

        dot.className = className.replace(/(?:^|\s)active(?!\S)/g, "");
      });

      clickedDot.className += " active";
    }
  }, {
    key: "_setPosition",
    value: function _setPosition(direction, position) {
      var inPos = undefined,
          outPos = undefined;

      if (direction === "next") {
        inPos = -position + "px";
        outPos = position + "px";
      } else if (direction === "previous") {
        inPos = position + "px";
        outPos = -position + "px";
      }

      return {
        inPos: inPos,
        outPos: outPos
      };
    }
  }, {
    key: "_setSelected",
    value: function _setSelected(direction) {
      var windowWidth = this.config.element.clientWidth;
      var pos = this._setPosition(direction, windowWidth);

      this.eventManager.removeAll();
      this.itemIn = this.itemActive;
      this._animateItemStart(this.items[this.itemIn], pos.inPos, 0);
      this._animateItemStart(this.items[this.itemOut], 0, pos.outPos);
      this._setDotClass(this.dots[this.itemActive]);
    }
  }, {
    key: "_skipTextNodes",
    value: function _skipTextNodes(el, method) {
      var element = el[method];

      while (element !== null && element.nodeType !== 1) {
        element = element.nextSibling;
      }

      return element;
    }
  }, {
    key: "_startAutoPlay",
    value: function _startAutoPlay() {
      this.itemOut = this.itemActive;

      if (this.itemActive < this.items.length - 1) {
        this.itemActive++;
      } else {
        this.itemActive = 0;
      }

      this._setSelected("next");
    }
  }, {
    key: "_stopAutoPlay",
    value: function _stopAutoPlay() {
      if (!this.animating && !_.isUndefined(this.timer)) {
        window.clearInterval(this.timer);

        this.timer = undefined;
      }
    }
  }, {
    key: "_trackSize",
    value: function _trackSize(device, size) {
      if (this.device !== device) {
        this.device = device;

        if (this.hasDataURLs) {
          this._setBackgroundImages(this.device);
        }
      }

      this.size = size;
    }
  }]);

  return CarouselClass;
}();

module.exports = CarouselClass;
//# sourceMappingURL=carousel.js.map