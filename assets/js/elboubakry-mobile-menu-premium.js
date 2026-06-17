(function () {
  'use strict';

  var mq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : { matches: false };
  if (!mq.matches) return;

  function bodyLock(lock) {
    document.body.classList.toggle('ea-mobile-menu-open', !!lock);
  }

  function closeMenu() {
    var area = document.querySelector('.offcanvas-area');
    var overlay = document.querySelector('.offcanvas-overlay');
    if (area) area.classList.remove('info-open');
    if (overlay) overlay.classList.remove('overlay-open');
    bodyLock(false);
  }

  function openMenu() {
    bodyLock(true);
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest('.sidebar-toggle')) {
      window.setTimeout(openMenu, 0);
      return;
    }
    if (event.target.closest('.offcanvas-close') || event.target.classList.contains('offcanvas-overlay')) {
      window.setTimeout(function () { bodyLock(false); }, 0);
      return;
    }
    var menuLink = event.target.closest('.offcanvas-area .mean-nav a, .offcanvas-diagnostic-cta a');
    if (menuLink) {
      window.setTimeout(closeMenu, 120);
    }
  }, true);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });
})();
