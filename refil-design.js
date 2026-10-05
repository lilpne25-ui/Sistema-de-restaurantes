// Quiet, scroll-linked movement. No dependencies or network required.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const photo = document.querySelector('.hero-photo');
  let queued = false;
  function paintHero() {
    queued = false;
    const progress = Math.min(1, scrollY / Math.max(1, innerHeight));
    photo.style.transform = reduce.matches ? 'none' : `translateY(${progress * 50}px) scale(${1 + progress * .045})`;
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(paintHero); }
  }, {passive:true});
  reduce.addEventListener('change', paintHero);
  const paths = {
    bebidas:'<path d="M7 3h10l-1 18H8L7 3Zm1 4h8M13 3l2-2"/>',
    ensalada:'<path d="M4 13h16c-1 6-4 8-8 8s-7-2-8-8ZM12 13C3 12 3 4 3 4s9-1 9 9Zm0 0C12 3 21 3 21 3s0 9-9 10Z"/>',
    desayuno:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M1 3v7m22-7v18M1 10v11"/>'
  };
  products.forEach(p => {p.emoji=`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[p.cat]}</svg>`;});
  renderProducts();
})();
