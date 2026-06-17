/* Mobile restore: lightweight word rotation + stable side menu population.
   No dependencies; desktop is left untouched. */
(function () {
  'use strict';

  var mobileQuery = window.matchMedia('(max-width: 768px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wordTimer = null;
  var activeWordIndex = 0;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function cloneMobileNav() {
    var source = document.querySelector('#mobile-menu > ul');
    var target = document.querySelector('.rs-offcanvas-menu nav');

    if (!source || !target) return;

    if (target.querySelector('ul[data-ea-mobile-nav="true"]')) return;

    var clone = source.cloneNode(true);
    clone.setAttribute('data-ea-mobile-nav', 'true');
    clone.classList.add('ea-mobile-side-nav');

    Array.prototype.slice.call(clone.querySelectorAll('a')).forEach(function (link) {
      link.addEventListener('click', function () {
        var menu = document.querySelector('.offcanvas-area');
        var overlay = document.querySelector('.offcanvas-overlay');
        document.body.classList.remove('ea-menu-locked');
        if (menu) menu.classList.remove('info-open');
        if (overlay) overlay.classList.remove('overlay-open');
      });
    });

    target.innerHTML = '';
    target.appendChild(clone);
  }

  function words() {
    return Array.prototype.slice.call(document.querySelectorAll('.rs-banner-one .ea-hero-role-line .cd-words-wrapper b'));
  }

  function setWord(index) {
    var allWords = words();
    if (!allWords.length) return;

    activeWordIndex = (index + allWords.length) % allWords.length;

    allWords.forEach(function (word, wordIndex) {
      var active = wordIndex === activeWordIndex;
      word.classList.toggle('is-visible', active);
      word.classList.toggle('is-hidden', !active);
      word.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
  }

  function stopWordRotation() {
    if (wordTimer) {
      window.clearInterval(wordTimer);
      wordTimer = null;
    }
  }

  function startWordRotation() {
    stopWordRotation();

    if (!mobileQuery.matches) return;

    var allWords = words();
    if (allWords.length < 2) return;

    setWord(activeWordIndex || 0);

    if (reduceMotion.matches) return;

    wordTimer = window.setInterval(function () {
      setWord(activeWordIndex + 1);
    }, 2400);
  }

  function sync() {
    cloneMobileNav();
    startWordRotation();
  }

  ready(sync);

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', sync);
    reduceMotion.addEventListener('change', startWordRotation);
  } else if (mobileQuery.addListener) {
    mobileQuery.addListener(sync);
    reduceMotion.addListener(startWordRotation);
  }
}());
