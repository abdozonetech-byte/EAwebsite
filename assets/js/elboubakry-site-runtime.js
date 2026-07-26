/**
 * Lightweight site runtime for Elboubakry.com.
 * Replaces the original demo-template plugin stack on content pages.
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  function ready(fn) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function rafThrottle(fn) {
    var pending = false;
    return function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        fn();
      });
    };
  }

  function setBackgrounds() {
    doc.querySelectorAll('[data-background]').forEach(function (node) {
      var url = node.getAttribute('data-background');
      if (url) node.style.backgroundImage = 'url("' + url.replace(/"/g, '\\"') + '")';
    });
  }

  function initStickyHeader() {
    var header = doc.getElementById('header-sticky');
    if (!header) return;
    var update = function () {
      header.classList.toggle('rs-sticky', window.scrollY > 120);
    };
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
    update();
  }

  function initOffcanvas() {
    var panel = doc.querySelector('.offcanvas-area');
    var overlay = doc.querySelector('.offcanvas-overlay');
    var toggle = doc.querySelector('.sidebar-toggle .bar-icon, .sidebar-toggle button');
    var close = doc.querySelector('.offcanvas-close-icon');
    if (!panel || !toggle) return;

    var mobileNav = panel.querySelector('.rs-offcanvas-menu nav, .mobile-menu nav');
    var sourceNav = doc.querySelector('#mobile-menu');
    if (mobileNav && sourceNav && !mobileNav.children.length) {
      mobileNav.innerHTML = sourceNav.innerHTML;
      mobileNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closePanel);
      });
    }

    function openPanel() {
      panel.classList.add('info-open');
      if (overlay) overlay.classList.add('overlay-open');
      panel.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      doc.body.classList.add('ea-menu-open');
      window.setTimeout(function () { if (close) close.focus({ preventScroll: true }); }, 30);
    }

    function closePanel() {
      panel.classList.remove('info-open');
      if (overlay) overlay.classList.remove('overlay-open');
      panel.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      doc.body.classList.remove('ea-menu-open');
    }

    toggle.addEventListener('click', function () {
      if (panel.classList.contains('info-open')) closePanel();
      else openPanel();
    });
    if (close) close.addEventListener('click', closePanel);
    if (overlay) overlay.addEventListener('click', closePanel);
    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('info-open')) {
        closePanel();
        toggle.focus({ preventScroll: true });
      }
    });
  }

  function initBackToTop() {
    var button = doc.querySelector('.backtotop-wrap');
    if (!button) return;
    var path = button.querySelector('path');
    var pathLength = 0;
    if (path && typeof path.getTotalLength === 'function') {
      pathLength = path.getTotalLength();
      path.style.strokeDasharray = pathLength + ' ' + pathLength;
      path.style.strokeDashoffset = pathLength;
    }
    var update = function () {
      var scrollTop = window.scrollY || root.scrollTop;
      var height = Math.max(root.scrollHeight - window.innerHeight, 1);
      button.classList.toggle('active-progress', scrollTop > 180);
      if (pathLength) path.style.strokeDashoffset = pathLength - (scrollTop * pathLength / height);
    };
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    update();
  }

  function initHeadline() {
    var wrapper = doc.querySelector('.cd-words-wrapper');
    if (!wrapper || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var words = Array.prototype.slice.call(wrapper.querySelectorAll('b'));
    if (words.length < 2) return;
    var index = Math.max(words.findIndex(function (word) { return word.classList.contains('is-visible'); }), 0);
    window.setInterval(function () {
      words[index].classList.remove('is-visible');
      words[index].classList.add('is-hidden');
      index = (index + 1) % words.length;
      words[index].classList.remove('is-hidden');
      words[index].classList.add('is-visible');
    }, 3200);
  }

  function initAnchorNavigation() {
    doc.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = doc.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      if (history.pushState) history.pushState(null, '', id);
    });
  }

  function initLazyIframes() {
    doc.querySelectorAll('iframe:not([loading])').forEach(function (iframe) {
      iframe.loading = 'lazy';
    });
  }

  ready(function () {
    setBackgrounds();
    initStickyHeader();
    initOffcanvas();
    initBackToTop();
    initHeadline();
    initAnchorNavigation();
    initLazyIframes();
  });
}());
