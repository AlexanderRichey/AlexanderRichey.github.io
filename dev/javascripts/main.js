import '../node_modules/aos/dist/aos.css';
import '../css/devicons.css';
import '../css/main.scss';

import AOS from 'aos';
import Slider from './slider';
import intro from './intro';
import { scrollTo } from './utils';

document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 600,
    disable: 'mobile',
    once: true
  });
  window.onload = AOS.refreshHard;
  intro();
  installNavListeners();
  setUpSlider();
});

function installNavListeners() {
  document.addEventListener('scroll', (e) => {
    if (document.body.scrollTop > 10) {
      document.getElementById('nav-container').style.opacity = 1;
    }
  });

  document.querySelectorAll('nav li').forEach(el => {
    el.addEventListener('click', (e) => {
      const className = e.currentTarget.dataset.dest;
      const destEl = document.querySelector(className);
      scrollTo(destEl.offsetTop, 500);
    });
  });
}

function setUpSlider() {
  const sliderNode = document.getElementById('slider');
  const sliderToken = new Slider(sliderNode)

  document.getElementById('left')
    .addEventListener('click', sliderToken.prevSlide);

  document.getElementById('right')
    .addEventListener('click', sliderToken.nextSlide);
}

