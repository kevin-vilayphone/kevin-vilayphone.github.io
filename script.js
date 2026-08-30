// Theme toggle (dark / light) — shared across every page
// Defaults to dark theme unless the visitor previously chose light
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('kv-theme');
if (savedTheme) {
  root.setAttribute('data-theme', savedTheme);
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('kv-theme', isLight ? 'dark' : 'light');
  });
}

// Mobile dropdown menu (World / France / About)
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    mainNav.classList.toggle('open');
  });
  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mainNav.classList.remove('open'));
  });
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && e.target !== navToggle) {
      mainNav.classList.remove('open');
    }
  });
}

// Masonry row-spans — keeps photos in the exact left-to-right, top-to-bottom
// order they appear in the HTML, with each figure's height following its
// image's real aspect ratio (must match --row-height/--row-gap in style.css)
function setSpan(fig){
  const img = fig.querySelector('img');
  const rowHeight = 8, gap = 16;
  const ratio = img.naturalHeight / img.naturalWidth;
  const colWidth = fig.getBoundingClientRect().width;
  const span = Math.ceil((colWidth * ratio + gap) / (rowHeight + gap));
  fig.style.gridRowEnd = 'span ' + span;
}
document.querySelectorAll('.gallery figure img').forEach(img => {
  if (img.complete && img.naturalWidth) setSpan(img.closest('figure'));
  else img.addEventListener('load', () => setSpan(img.closest('figure')));
});
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.querySelectorAll('.gallery figure').forEach(setSpan);
  }, 150);
});

// Reveal on scroll — trip cards on the homepage, photos on trip pages
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.gallery figure, .trip-card').forEach(f => io.observe(f));

// Lightbox — only present on trip pages
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = document.getElementById('lbImg');
  const lbSeries = document.getElementById('lbSeries');
  const lbCounter = document.getElementById('lbCounter');
  let currentSet = [];
  let currentIndex = 0;

  function openLightbox(fig){
    currentSet = Array.from(fig.closest('.gallery').querySelectorAll('figure'));
    currentIndex = currentSet.indexOf(fig);
    render();
    lightbox.showModal();
  }
  function render(){
    const fig = currentSet[currentIndex];
    const img = fig.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbSeries.textContent = fig.dataset.series;
    if (lbCounter) lbCounter.textContent = (currentIndex + 1) + ' / ' + currentSet.length;
  }
  document.querySelectorAll('.gallery figure').forEach(fig => {
    fig.addEventListener('click', () => openLightbox(fig));
  });
  document.getElementById('lbClose').addEventListener('click', () => lightbox.close());
  document.getElementById('lbPrev').addEventListener('click', (e) => { e.stopPropagation(); currentIndex = (currentIndex - 1 + currentSet.length) % currentSet.length; render(); });
  document.getElementById('lbNext').addEventListener('click', (e) => { e.stopPropagation(); currentIndex = (currentIndex + 1) % currentSet.length; render(); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.open) return;
    if (e.key === 'Escape') lightbox.close();
    if (e.key === 'ArrowLeft') document.getElementById('lbPrev').click();
    if (e.key === 'ArrowRight') document.getElementById('lbNext').click();
  });
}
