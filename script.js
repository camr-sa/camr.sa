const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');

const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

const slides = [...document.querySelectorAll('.hero-slide')];
const counter = document.querySelector('#slide-current');
let active = 0;
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    slides[active].classList.remove('is-active');
    active = (active + 1) % slides.length;
    slides[active].classList.add('is-active');
    counter.textContent = String(active + 1).padStart(2, '0');
  }, 5200);
}

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
  dialogImg.src = button.dataset.lightbox;
  dialog.showModal();
}));
dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && dialog.open) dialog.close(); });

document.querySelector('#year').textContent = new Date().getFullYear();
