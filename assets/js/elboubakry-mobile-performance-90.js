/* Upgrade 03 — mobile-only UI/performance helpers.
   Keeps desktop untouched and preserves existing menu, hero animation, and carousel. */
(function () {
  'use strict';

  var isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) {
    return;
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('ea-mobile-upgrade-03');

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  ready(function () {
    var hero = document.querySelector('#homeonepage');
    var heroImage = document.querySelector('#homeonepage .ea-hero-portrait-photo img, #homeonepage .rs-banner-thumb img');

    if (heroImage) {
      heroImage.setAttribute('loading', 'eager');
      heroImage.setAttribute('fetchpriority', 'high');
      heroImage.setAttribute('decoding', 'async');
    }

    Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
      if (image === heroImage) {
        return;
      }
      var insideHero = hero && hero.contains(image);
      if (!insideHero) {
        image.setAttribute('loading', 'lazy');
        image.setAttribute('decoding', 'async');
        image.setAttribute('fetchpriority', 'low');
      }
    });

    Array.prototype.slice.call(document.querySelectorAll('#homeportfolio img, #homeservices img, #homemarketingsystem img, #homefaq img, footer img')).forEach(function (image) {
      image.setAttribute('loading', 'lazy');
      image.setAttribute('decoding', 'async');
      image.setAttribute('fetchpriority', 'low');
    });

    if (!reduceMotion && 'IntersectionObserver' in window) {
      var revealItems = Array.prototype.slice.call(document.querySelectorAll([
        '#homemarketingsystem .ea-orbit-item',
        '#homemarketingsystem .ea-transform-values > div',
        '#homeservices .ea-funnel-card',
        '#homeservices .ea-funnel-visual',
        '#homeportfolio .elb-carousel-shell',
        '#homefaq .ea-home-faq-item',
        '#footer-contact .ea-footer-block'
      ].join(',')));

      revealItems.forEach(function (item, index) {
        item.classList.add('ea-mobile-soft-reveal');
        item.style.setProperty('--ea-mobile-reveal-delay', Math.min(index * 32, 180) + 'ms');
      });

      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      revealItems.forEach(function (item) {
        revealObserver.observe(item);
      });
    }
  });
})();
