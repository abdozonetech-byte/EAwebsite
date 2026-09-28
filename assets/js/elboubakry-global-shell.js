(() => {
  const header = document.querySelector('[data-shell-header]');
  const nav = document.querySelector('[data-shell-nav]');
  const menu = document.querySelector('[data-shell-menu]');

  if (header) {
    const progress = document.createElement('span');
    progress.className = 'ea-shell-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    let ticking = false;
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    }, { passive: true });
    updateScroll();
  }

  if (menu && nav) {
    const close = () => {
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Ouvrir le menu');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    window.addEventListener('resize', () => { if (window.innerWidth > 1020) close(); });
  }

  const targets = document.querySelectorAll([
    '[data-shell-reveal]',
    '.ea-services-hero-grid',
    '.ea-services-heading',
    '.ea-offer-card',
    '.ea-services-fit-grid article',
    '.ea-services-process-grid article',
    '.ea-services-cta',
    '.ea-article-hero .container',
    '.ea-article-content > h2',
    '.ea-service-card',
    '.ea-skill-groups section',
    '.ea-career-timeline article',
    '.ea-article-cta',
    '.ea-article-side-card',
    '.ea-insights-hero-grid',
    '.ea-featured-insight-card',
    '.ea-seo-path-head',
    '.ea-seo-path-grid article',
    '.rs-section-title-wrapper',
    '.ea-watch-panel',
    '.ea-insights-cta'
  ].join(','));
  if (!targets.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px' });
  targets.forEach((target) => {
    target.classList.add('ea-shell-reveal');
    observer.observe(target);
  });
})();
