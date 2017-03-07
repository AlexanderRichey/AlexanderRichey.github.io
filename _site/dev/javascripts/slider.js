export default class Slider {
  constructor(containerNode) {
    this.slides = Array.from(containerNode.children);
    this.numSlides = this.slides.length;
    this.idx = 0;

    this.slides.forEach((slide, idx) => {
      slide.classList.add('slide');
      slide.dataset.idx = idx;
    });

    this.nextSlide = this.nextSlide.bind(this)
    this.prevSlide = this.prevSlide.bind(this)

    this.render();
  }

  render() {
    this.slides.forEach(slide => {
      slide.classList.remove('active', 'next', 'prev');

      const idx = slide.dataset.idx;
      if (idx == this.idx) {
        slide.classList.add('active');
      } else if (idx == (this.idx + 1) % this.numSlides) {
        slide.classList.add('next');
      } else if (idx == (this.idx + this.numSlides - 1) % this.numSlides) {
        slide.classList.add('prev');
      }
    });
  }

  nextSlide() {
    this.idx = (this.idx + 1) % this.numSlides;
    this.render();
  }

  prevSlide() {
    this.idx = (this.idx + this.numSlides - 1) % this.numSlides;
    this.render();
  }
}
