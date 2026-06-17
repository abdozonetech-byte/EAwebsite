/* Upgrade 09 — Mobile core optimized
   Scope: mobile homepage only. Keeps desktop scripts untouched by the desktop loader. */
(function () {
  'use strict';

  var mobileQuery = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
  if (!mobileQuery || !mobileQuery.matches) return;

  var doc = document;
  var body = doc.body;
  doc.documentElement.classList.add('ea-mobile-core-ready');

  function qs(selector, root) { return (root || doc).querySelector(selector); }
  function qsa(selector, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(selector)); }

  function setDataBackgrounds() {
    qsa('[data-background]').forEach(function (element) {
      var image = element.getAttribute('data-background');
      if (image && !element.style.backgroundImage) {
        element.style.backgroundImage = 'url(' + image + ')';
      }
    });
  }

  function createMobileMenu() {
    var sourceList = qs('#mobile-menu .onepage-menu');
    var targetNav = qs('.rs-offcanvas-menu nav');
    if (!sourceList || !targetNav) return;

    var links = qsa('a', sourceList).map(function (link) {
      return {
        href: link.getAttribute('href') || '#',
        label: (link.textContent || '').replace(/\s+/g, ' ').trim(),
        active: link.classList.contains('active')
      };
    }).filter(function (item) { return item.label; });

    if (!links.length) return;

    targetNav.innerHTML = '<div class="mean-container"><div class="mean-bar"><nav class="mean-nav"><ul>' +
      links.map(function (item, index) {
        var cls = item.active || index === 0 ? ' class="active"' : '';
        return '<li><a' + cls + ' href="' + item.href + '">' + item.label + '</a></li>';
      }).join('') +
      '</ul></nav></div></div>';
  }

  function setMenuOpen(open) {
    var area = qs('.offcanvas-area');
    var overlay = qs('.offcanvas-overlay');
    if (!area) return;
    area.classList.toggle('info-open', open);
    if (overlay) overlay.classList.toggle('overlay-open', open);
    body.classList.toggle('ea-menu-open', open);
    body.style.overflow = open ? 'hidden' : '';
  }

  function setupMenu() {
    createMobileMenu();

    qsa('.sidebar-toggle, .sidebar-toggle button').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        setMenuOpen(true);
      }, { passive: false });
    });

    qsa('.offcanvas-close, .offcanvas-close button, .offcanvas-overlay').forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        setMenuOpen(false);
      }, { passive: false });
    });

    qsa('.offcanvas-area a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenuOpen(false);
      }, { passive: true });
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setMenuOpen(false);
    });
  }

  function setupHeroWordRotation() {
    var wrapper = qs('.cd-words-wrapper');
    if (!wrapper) return;
    var words = qsa('b', wrapper);
    if (words.length < 2) return;

    var index = Math.max(0, words.findIndex(function (word) { return word.classList.contains('is-visible'); }));
    if (index < 0) index = 0;

    words.forEach(function (word, i) {
      word.classList.toggle('is-visible', i === index);
      word.classList.toggle('is-hidden', i !== index);
    });

    window.setInterval(function () {
      var next = (index + 1) % words.length;
      words[index].classList.remove('is-visible');
      words[index].classList.add('is-hidden');
      words[next].classList.remove('is-hidden');
      words[next].classList.add('is-visible');
      index = next;
    }, 2200);
  }

  function setupBackToTop() {
    var button = qs('.backtotop-wrap');
    if (!button) return;
    button.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, { passive: false });
  }

  function loadDeferredCSS() {
    if (typeof window.eaLoadDeferredMobileCSS === 'function') {
      window.eaLoadDeferredMobileCSS();
    }
  }

  function afterIdle(callback, timeout) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: timeout || 2200 });
    } else {
      window.setTimeout(callback, timeout || 1200);
    }
  }

  function loadScriptOnce(src, id) {
    if (!src || (id && doc.getElementById(id)) || doc.querySelector('script[src="' + src.replace(/"/g, '\\"') + '"]')) return;
    var script = doc.createElement('script');
    if (id) script.id = id;
    script.src = src;
    script.async = true;
    doc.body.appendChild(script);
  }

  function observeAndLoad(selector, src, id) {
    var target = qs(selector);
    if (!target) return;
    if (!('IntersectionObserver' in window)) {
      afterIdle(function () { loadScriptOnce(src, id); }, 2400);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        loadScriptOnce(src, id);
      });
    }, { root: null, rootMargin: '420px 0px', threshold: 0.01 });
    observer.observe(target);
  }

  function setupDeferredFeatures() {
    afterIdle(loadDeferredCSS, 1800);
    observeAndLoad('#homeportfolio', '/assets/js/elboubakry-mockup-carousel.js?v=mobile-late-20260617', 'ea-mobile-carousel-js');
    observeAndLoad('#homeservices', '/assets/js/elboubakry-funnel-lightbox.js?v=mobile-late-20260617', 'ea-mobile-funnel-js');
    afterIdle(function () {
      loadScriptOnce('/assets/js/elboubakry-mobile-motion.js?v=mobile-late-20260617', 'ea-mobile-motion-js');
    }, 2600);
  }

  function init() {
    setDataBackgrounds();
    setupMenu();
    setupHeroWordRotation();
    setupBackToTop();
    setupDeferredFeatures();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
