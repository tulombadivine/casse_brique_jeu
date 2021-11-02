const animationClasses = {
  forwards: {
    in: 'slide-in-forwards',
    out: 'slide-out-forwards' },

  backwards: {
    in: 'slide-in-backwards',
    out: 'slide-out-backwards' } };

/**
 *
 *    Selectors
 */
const controlPrev = document.querySelector('[data-control=prev]');
const controlNext = document.querySelector('[data-control=next]');
const background = document.querySelector('[data-select=background]');
const slidesQuery = document.querySelectorAll('[data-slide]');
const slides = _.chain(slidesQuery).
filter(slide => slide.getAttribute('data-slide')).
value();

/**
 *
 *    Functions
 */
let index = 0;
let prevSlide = 0;

const timing = 500; // in ms
const increment = () => index < slides.length - 1 ? index += 1 : index;
const decrement = () => index > 0 ? index -= 1 : index;

const animateClass = (el, dir, type, delay = 0) => {
  el.classList.add(animationClasses[dir][type]);
  setTimeout(() => el.classList.remove(animationClasses[dir][type]), delay);
};

const animateSlide = () => {
  let current = slides[index];
  let previous = slides[prevSlide];
  let dir = prevSlide > index ? 'backwards' : 'forwards';
  background.classList.remove('animate-forwards');
  background.classList.remove('animate-backwards');
  setTimeout(() => {
    background.classList.add('animate-' + dir);
  }, 100);
  animateClass(previous, dir, 'out', timing);
  disableControls();
  setTimeout(() => {
    current.classList.add('active');
    previous.classList.remove('active');
    animateClass(current, dir, 'in', timing);
    enableControls();
  }, timing);
};

const disableControls = () => {
  controlPrev.disabled = true;
  controlNext.disabled = true;
};

const enableControls = () => {
  controlPrev.disabled = index == 0;
  controlNext.disabled = index == slides.length - 1;
};

/**
 *
 *    Events
 */
controlPrev.addEventListener('click', () => {
  decrement();
  animateSlide();
  prevSlide = index;
});

controlNext.addEventListener('click', () => {
  increment();
  animateSlide();
  prevSlide = index;
});

const current = slides[index];
current.classList.add('active');
animateClass(current, 'forwards', 'in', timing);
