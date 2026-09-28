(() => {
  const header = document.querySelector('.ea-header');
  const progress = document.createElement('div');
  progress.className = 'ea-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  let scrollTicking = false;
  const updateScrollEffects = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.setProperty('--ea-scroll-progress', String(value));
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

  const menuButton = document.querySelector('.ea-menu-button');
  const navigation = document.querySelector('.ea-nav');

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    document.body.classList.remove('menu-open');
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Ouvrir le menu');
  };

  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      document.body.classList.toggle('menu-open', willOpen);
      navigation.classList.toggle('is-open', willOpen);
      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.setAttribute('aria-label', willOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    });

    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1020) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const revealItems = [...document.querySelectorAll('[data-reveal]')];
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px' });

  revealItems.forEach((item) => observer.observe(item));
})();
