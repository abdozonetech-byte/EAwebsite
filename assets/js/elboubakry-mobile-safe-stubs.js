/* Upgrade 03 — mobile-only performance safety stubs.
   Purpose: on phones, avoid loading desktop-only plugin files while keeping main.js safe.
   Desktop is untouched. */
(function () {
  'use strict';

  var isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) {
    return;
  }

  window.WOW = window.WOW || function () { return { init: function () {} }; };
  window.jarallax = window.jarallax || function () {};
  window.PureCounter = window.PureCounter || function () {};
  window.Swiper = window.Swiper || function () {
    return { update: function () {}, destroy: function () {}, slideTo: function () {} };
  };
  window.Lenis = window.Lenis || function () { return { raf: function () {} }; };

  if (window.jQuery) {
    var $ = window.jQuery;
    $.fn.magnificPopup = $.fn.magnificPopup || function () { return this; };
    $.fn.niceSelect = $.fn.niceSelect || function () { return this; };
    $.fn.easyPieChart = $.fn.easyPieChart || function () { return this; };
    $.fn.isotope = $.fn.isotope || function () { return this; };
    $.fn.imagesLoaded = $.fn.imagesLoaded || function (callback) {
      if (typeof callback === 'function') {
        callback.call(this);
      }
      return this;
    };
    $.fn.lettering = $.fn.lettering || function () { return this; };
  }
})();
