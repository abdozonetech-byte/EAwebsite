(function () {
  'use strict';

  function hidePreloader() {
    var preloader = document.getElementById('pre-load');
    if (!preloader) return;
    preloader.style.transition = 'opacity 0.35s ease';
    preloader.style.opacity = '0';
    window.setTimeout(function () {
      preloader.style.display = 'none';
      preloader.setAttribute('aria-hidden', 'true');
    }, 380);
  }

  function preloaderDelay(defaultDelay) {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches ? 120 : defaultDelay;
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.setTimeout(hidePreloader, preloaderDelay(900));
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      window.setTimeout(hidePreloader, preloaderDelay(900));
    });
  }

  window.addEventListener('load', function () {
    window.setTimeout(hidePreloader, preloaderDelay(700));
  });

  /* Safety fallback: never leave the visitor blocked by the loading screen. */
  window.setTimeout(hidePreloader, 3200);
})();
