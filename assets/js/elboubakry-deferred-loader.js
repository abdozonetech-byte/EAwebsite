/* Load below-the-fold interaction and animation scripts after the first screen. */
(function () {
  'use strict';

  var loaded = false;
  var scripts = [
    '/assets/js/vendor/jquery-3.7.1.min.js',
    '/assets/js/plugins/waypoints.min.js',
    '/assets/js/vendor/bootstrap.bundle.min.js',
    '/assets/js/plugins/meanmenu.min.js',
    '/assets/js/plugins/swiper.min.js',
    '/assets/js/plugins/wow.js',
    '/assets/js/vendor/magnific-popup.min.js',
    '/assets/js/vendor/isotope.pkgd.min.js',
    '/assets/js/vendor/imagesloaded.pkgd.min.js',
    '/assets/js/plugins/nice-select.min.js',
    '/assets/js/plugins/jarallax.min.js',
    '/assets/js/vendor/ajax-form.js',
    '/assets/js/plugins/easypie.js',
    '/assets/js/plugins/headding-title.js',
    '/assets/js/plugins/lenis.min.js',
    '/assets/js/plugins/gsap.min.js',
    '/assets/js/plugins/rs-anim-int.js',
    '/assets/js/plugins/rs-scroll-trigger.min.js',
    '/assets/js/plugins/rs-splitText.min.js',
    '/assets/js/plugins/jquery.lettering.js',
    '/assets/js/plugins/parallax-effect.min.js',
    '/assets/js/vendor/purecounter.js',
    '/assets/js/main.js',
    '/assets/js/elboubakry-mobile-motion.js',
    '/assets/js/elboubakry-funnel-lightbox.js'
  ];

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function loadAll() {
    if (loaded) return;
    loaded = true;
    scripts.reduce(function (chain, src) {
      return chain.then(function () { return loadScript(src); });
    }, Promise.resolve()).catch(function (error) {
      if (window.console && console.warn) {
        console.warn('Deferred script failed to load', error);
      }
    });
  }

  function schedule() {
    window.setTimeout(loadAll, 15000);
  }

  ['pointerdown', 'touchstart', 'keydown', 'scroll'].forEach(function (eventName) {
    window.addEventListener(eventName, loadAll, { once: true, passive: true });
  });

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
}());
