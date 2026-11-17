const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });
const menuLabel = document.querySelector('#menu-toggle-label');
const isArabic = document.documentElement.lang === 'ar';
const setMenu = open => {
  header.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuLabel.textContent = open ? (isArabic ? 'إغلاق القائمة' : 'Close menu') : (isArabic ? 'فتح القائمة' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
  document.body.classList.toggle('menu-open', open);
  if (!open) menuButton.focus({ preventScroll: true });
};
menuButton.addEventListener('click', () => setMenu(!header.classList.contains('menu-open')));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && header.classList.contains('menu-open')) setMenu(false); });
const langSwitch = document.querySelector('.nav-lang');
if (langSwitch) langSwitch.addEventListener('click', e => {
  if (location.hash) { e.preventDefault(); const target = langSwitch.getAttribute('href'); location.href = target + location.hash; }
});
const slides = [...document.querySelectorAll('.hero-slide')];
const counter = document.querySelector('#slide-current');
let active = 0;
const deferredImgs = document.querySelectorAll('img[data-src]');
const loadDeferred = () => deferredImgs.forEach(img => {
  if (img.dataset.srcset) img.srcset = img.dataset.srcset;
  img.src = img.dataset.src;
});
const scheduleDeferred = () => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(loadDeferred);
  else setTimeout(loadDeferred, 200);
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleDeferred);
} else {
  scheduleDeferred();
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let sliderTimer = null;
let heroHovered = false;
const nextSlide = () => {
  slides[active].classList.remove('is-active');
  active = (active + 1) % slides.length;
  slides[active].classList.add('is-active');
  counter.textContent = String(active + 1).padStart(2, '0');
};
const startSlider = () => {
  if (reduceMotion || sliderTimer || document.hidden || heroHovered || slides.length < 2) return;
  sliderTimer = setInterval(nextSlide, 5200);
};
const stopSlider = () => { clearInterval(sliderTimer); sliderTimer = null; };
// Pause while the tab is hidden and while a mouse hovers the hero (desktop).
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSlider(); else startSlider(); });
const hero = document.querySelector('.hero');
if (hero) {
  hero.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { heroHovered = true; stopSlider(); } });
  hero.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { heroHovered = false; startSlider(); } });
}
startSlider();
const observer = new IntersectionObserver(entries => {
for (const entry of entries) if (entry.isIntersecting) {
entry.target.classList.add('is-visible');
observer.unobserve(entry.target);
}
}, { threshold: 0.13 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
const dialog = document.querySelector('#lightbox');
const dialogImg = dialog.querySelector('img');
document.querySelectorAll('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
const sourceImg = button.querySelector('img');
if (sourceImg && sourceImg.alt) dialogImg.alt = sourceImg.alt;
dialogImg.src = button.dataset.lightbox;
dialog.showModal();
}));
dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && dialog.open) dialog.close(); });
document.querySelector('#year').textContent = new Date().getFullYear();