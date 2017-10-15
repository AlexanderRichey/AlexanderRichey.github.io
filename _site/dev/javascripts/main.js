import '../node_modules/aos/dist/aos.css';
import '../css/devicons.css';
import '../css/main.scss';

import AOS from 'aos';
import Slider from './slider';
import intro from './intro';
import { scrollTo, debounce } from './utils';

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
  const navContainer = document.getElementById('nav-container')
  document.addEventListener('scroll', debounce(function (e) {
    if (document.documentElement.scrollTop > 10) {
      navContainer.style.opacity = 1;
      document.removeEventListener('scroll', this)
    }
  }, 200));

  document.querySelectorAll('nav li').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.currentTarget.dataset.dest) {
        const className = e.currentTarget.dataset.dest;
        const destEl = document.querySelector(className);
        scrollTo(destEl.offsetTop, 500);
      }
    });
  });
}

function setUpSlider() {
  const sliderNode = document.getElementById('slider');
  const left = document.getElementById('left')
  const right = document.getElementById('right')
  const sliderToken = new Slider(sliderNode)

  left.addEventListener('click', sliderToken.prevSlide);
  right.addEventListener('click', sliderToken.nextSlide);
}

