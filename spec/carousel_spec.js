const CarouselClass = require("../src/carousel");

describe("carousel", () => {
  let carousel;

  beforeEach(() => {
    carousel = new CarouselClass({
      element: carousel,
      autoPlay: false,
      itemClass: "carousel-item"
    }, false);
  });

  it("should exist", () => {
    expect(carousel).toBeDefined();
  });
});