const _ = require("lodash");
const CarouselClass = require("../src/carousel");

function createCarousel() {
  let carouselInner = document.createElement("div");
  let carouselOuter = document.createElement("div");

  carouselInner.className = "carousel-inner";
  carouselOuter.id = "carousel";

  carouselOuter.appendChild(carouselInner);

  createCarouselItems(carouselInner);

  document.body.appendChild(carouselOuter);

  return carouselOuter;
}

function createCarouselImageContainers(item, i) {
  let dataURLDesktop, dataURLMobile, dataURLTablet;
  let carouselImageContainer = document.createElement("div");

  carouselImageContainer.className = "carousel-image-container";

  dataURLDesktop = "desktop.jpg";

  if(i % 2) {
    dataURLMobile = "null";
    dataURLTablet = "null";
  } else {
    dataURLMobile = "mobile.jpg";
    dataURLTablet = "tablet.jpg";
  }

  carouselImageContainer.setAttribute("data-mobile", dataURLMobile);
  carouselImageContainer.setAttribute("data-tablet", dataURLTablet);
  carouselImageContainer.setAttribute("data-desktop", dataURLDesktop);

  carouselImageContainer.style.backgroundImage = "url('" + dataURLDesktop + "')";

  createCarouselOverlays(carouselImageContainer, i);

  item.appendChild(carouselImageContainer);
}

function createCarouselItems(carouselInner, items = 2) {
  let item;
  let range = _.range(1, (items + 1));

  _.forEach(range, (i) => {
    item = document.createElement("div");
    item.className = "carousel-item";

    createCarouselImageContainers(item, i);

    carouselInner.appendChild(item);
  });
}

function createCarouselOverlays(carouselImageContainer, i) {
  let carouselOverlay = document.createElement("div");
  let a = document.createElement("a");
  let subtitle = document.createElement("h3");
  let title = document.createElement("h2");

  carouselOverlay.className = "carousel-overlay";

  if(i % 2) {
    a.href = "http://www.bobdylan.com";
    a.innerHTML = "Bob Dylan";
    title.innerHTML = "Bob Dylan's official website"
    subtitle.innerHTML = "He's a gruff-voiced mega-dude"

  } else {
    a.href = "http://www.paulsimon.com";
    a.innerHTML = "Paul Simon";
    title.innerHTML = "Paul Simon's official website"
    subtitle.innerHTML = "He's a tiny little showbiz man"
  }

  carouselOverlay.appendChild(title);
  carouselOverlay.appendChild(subtitle);
  carouselOverlay.appendChild(a);

  carouselImageContainer.appendChild(carouselOverlay);
}

describe("carousel", () => {
  let c, carousel, viewport;

  beforeEach(() => {
    c = createCarousel();
    viewport = CarouselClass.__get__("viewport");

    carousel = new CarouselClass({
      element: c,
      autoPlay: false,
      itemClass: "carousel-item"
    }, false);

    carousel.animating = false;
    carousel.hasDataURLs = false;
    carousel.itemActive = 0;
    carousel.items = [];
  });

  it("should exist", () => {
    expect(carousel).toBeDefined();
  });

  describe("render function", () => {
    beforeEach(() => {
      spyOn(carousel, "_getItems");
      spyOn(carousel, "_setDefaultSelected");

      carousel.render();
    });

    it("should call the _getItems function", () => {
      expect(carousel._getItems).toHaveBeenCalled();
    });

    it("should call the _setDefaultSelected function", () => {
      expect(carousel._setDefaultSelected).toHaveBeenCalled();
    });
  });

  // decribe("_addDotClickListeners function", () => {
    // How do I test this?
  // });

  // decribe("_addFocusListeners function", () => {
    // How do I test this?
  // });

  // decribe("_addNextListener function", () => {
    // How do I test this?
  // });

  // decribe("_addPreviousListener function", () => {
    // How do I test this?
  // });

  describe("_checkDataURLs function", () => {
    let carouselItem, imageContainer;

    beforeEach(() => {
      carousel.items = carousel.config.element.querySelectorAll("." + carousel.config.itemClass);

      spyOn(carousel, "_overrideNullDataURLs");
      spyOn(carousel, "_setBackgroundImages");
    });

    describe("when there are null data URLs", () => {
      beforeEach(() => {
        carouselItem = carousel.items[0];
        imageContainer = carouselItem.children[0];

        spyOn(carousel, "_skipTextNodes").and.returnValue(imageContainer);

        carousel._checkDataURLs();
      });

      it("should call the _overrideNullDataURLs function", () => {
        expect(carousel._overrideNullDataURLs).toHaveBeenCalled();
      });
    });

    describe("when there are no null data URLs", () => {
      beforeEach(() => {
        carouselItem = carousel.items[1];
        imageContainer = carouselItem.children[0];

        spyOn(carousel, "_skipTextNodes").and.returnValue(imageContainer);

        carousel._checkDataURLs();
      });

      it("should call the _overrideNullDataURLs function", () => {
        expect(carousel._overrideNullDataURLs).not.toHaveBeenCalled();
      });
    });
  });

  describe("_getItems function", () => {
    beforeEach(() => {
      spyOn(carousel, "_createArrowNavContainer");
      spyOn(carousel, "_createDotsNavContainer");
      spyOn(carousel, "_checkDataURLs");
    });

    it("should assign the items to this.items", () => {
      carousel._getItems();

      expect(carousel.items.length).toEqual(2);
    });

    describe("when there is more than 1 item", () => {
      beforeEach(() => {
        carousel._getItems();
      });

      it("should call the _createArrowNavContainer function", () => {
        carousel._getItems();

        expect(carousel._createArrowNavContainer).toHaveBeenCalled();
      });

      it("should call the _createDotsNavContainer function", () => {
        carousel._getItems();

        expect(carousel._createDotsNavContainer).toHaveBeenCalled();
      });
    });

    describe("when there are fewer than 2 items", () => {
      beforeEach(() => {
        carousel.config.itemClass = "not-my-item-class";

        carousel._getItems();
      });

      it("should not call the _createArrowNavContainer function", () => {
      
        expect(carousel._createArrowNavContainer).not.toHaveBeenCalled();
      });

      it("should not call the _createDotsNavContainer function", () => {

        expect(carousel._createDotsNavContainer).not.toHaveBeenCalled();
      });
    });
  });

  describe("_init function", () => {
    beforeEach(() => {
      spyOn(carousel, "render");

      carousel._init();
    });

    it("should set this.animating to false", () => {
      expect(carousel.animating).toBeFalsy();
    });

    it("should set this.eventManager to the _manageListeners function", () => {
      expect(carousel.eventManager.addListener).toBeDefined();
      expect(carousel.eventManager.removeAll).toBeDefined();
    });

    it("should set this.hasDataURLs to false", () => {
      expect(carousel.hasDataURLs).toBeFalsy();
    });

    it("should set this.itemActive to 0", () => {
      expect(carousel.itemActive).toEqual(0);
    });

    it("should set this.items to be an empty array", () => {
      expect(carousel.items.length).toEqual(0);
    });

    it("should call the render function", () => {
      expect(carousel.render).toHaveBeenCalled();
    });
  });

  describe("_initViewport function", () => {
    beforeEach(() => {
      spyOn(viewport, "getDevice").and.returnValue("massive swanky monitor");
      spyOn(viewport, "windowSize").and.returnValue("99999px");
      spyOn(viewport, "trackSize");

      carousel._initViewport();

    });

    it("should set this.device to the viewport.getDevice function", () => {

      expect(carousel.device).toEqual("massive swanky monitor");
    });

    it("should set this.size to the viewport.windowSize function", () => {

      expect(carousel.size).toEqual("99999px");
    });

    it("should call the viewport.trackSize function", () => {
      expect(viewport.trackSize).toHaveBeenCalled();
    });
  });

  // describe("_overrideNullDataURLs function", () => {

  // });

  describe("_startAutoPlay function", () => {
    beforeEach(() => {
      carousel.items = carousel.config.element.querySelectorAll("." + carousel.config.itemClass);

      spyOn(carousel, "_setSelected");
    });

    it("should set this.itemOut to be the same value as this.itemActive", () => {
      carousel.itemActive = 1;
      
      carousel._startAutoPlay();

      expect(carousel.itemOut).toEqual(1);
    });

    it("should call the _setSelected function with a parameter of 'next'", () => {
      carousel.itemActive = 1;
      
      carousel._startAutoPlay();

      expect(carousel._setSelected).toHaveBeenCalledWith("next");
    });

    describe("when this.itemActive is less than this.items.length - 1", () => {
      beforeEach(() => {
        carousel.itemActive = 0;

        carousel._startAutoPlay();
      });

      it("should increment this.itemActive by 1", () => {
        expect(carousel.itemActive).toEqual(1);
      });
    });

    describe("when this.itemActive is greater than or equal to this.items.length - 1", () => {
      beforeEach(() => {
        carousel.itemActive = 1;

        carousel._startAutoPlay();
      });

      it("should set this.itemActive to be 0", () => {
        expect(carousel.itemActive).toEqual(0);
      });
    });
  });

  describe("_stopAutoPlay function", () => {
    beforeEach(() => {
      spyOn(window, "clearInterval");
    });

    describe("when this.animating is false and this.timer is not undefined", () => {
      beforeEach(() => {
        carousel.animating = false;
        carousel.timer = window.setInterval(carousel._startAutoPlay.bind(), 5000);

        carousel._stopAutoPlay();
      });

      it("should call the window.clearInterval function", () => {
        expect(window.clearInterval).toHaveBeenCalled();
      });

      it("should set this.timer to be undefined", () => {
        expect(carousel.timer).not.toBeDefined();
      });
    });

    describe("when this.animating is true and this.timer is undefined", () => {
      beforeEach(() => {
        carousel.animating = true;
        carousel.timer = undefined;
      });

      it("should not call the window.clearInterval function", () => {
        expect(window.clearInterval).not.toHaveBeenCalled();
      });
    });
  });

  describe("_trackSize function", () => {
    beforeEach(() => {
      carousel.size = 1200;

      carousel._trackSize("mobile", 760);
    });

    it("should set this.size to the same value as the size parameter", () => {
      
      expect(carousel.size).toEqual(760);
    });

    describe("when this.device is not equal to the device parameter", () => {
      beforeEach(() => {
        carousel.device = "desktop";

        spyOn(carousel, "_setBackgroundImages");
      });

      it("should set this.device to the same value as the device parameter", () => {
        carousel._trackSize("mobile", 767);

        expect(carousel.device).toEqual("mobile");
      });

      describe("when this.hasDataURLs is true", () => {
        beforeEach(() => {
          carousel.hasDataURLs = true;

          carousel._trackSize("mobile", 767);
        });

        it("should call the _.setBackGroundImages function", () => {
          expect(carousel._setBackgroundImages).toHaveBeenCalled();
        });
      });

      describe("when this.hasDataURLs is false", () => {
        beforeEach(() => {
          carousel.hasDataURLs = false;

          carousel._trackSize("mobile", 767);
        });

        it("should not call the _._setBackgroundImages function", () => {
          expect(carousel._setBackgroundImages).not.toHaveBeenCalled();
        });
      });
    });
  });
});