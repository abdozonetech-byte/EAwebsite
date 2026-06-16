/* Upgrade 12 — Mobile menu state helper
   Locks background scrolling while the offcanvas menu is open and improves accessibility state.
*/
(function () {
  'use strict';

  var body = document.body;
  var menu = document.querySelector('.offcanvas-area');
  var overlay = document.querySelector('.offcanvas-overlay');
  var toggle = document.querySelector('.sidebar-toggle');
  var toggleButton = toggle ? toggle.querySelector('button, .bar-icon') : null;
  var closeButton = document.querySelector('.offcanvas-close button, .offcanvas-close-icon');

  if (!menu) return;

  function isOpen() {
    return menu.classList.contains('info-open');
  }

  function syncState() {
    var open = isOpen();
    body.classList.toggle('ea-menu-locked', open);
    if (toggleButton) toggleButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggleButton) {
    toggleButton.setAttribute('aria-controls', 'mobile-menu');
    toggleButton.setAttribute('aria-expanded', 'false');
  }
  function openMenu(event) {
    if (event) event.preventDefault();
    menu.classList.add('info-open');
    if (overlay) overlay.classList.add('overlay-open');
    syncState();
  }

  function closeMenu(event) {
    if (event) event.preventDefault();
    menu.classList.remove('info-open');
    if (overlay) overlay.classList.remove('overlay-open');
    syncState();
  }

  var observer = new MutationObserver(syncState);
  observer.observe(menu, { attributes: true, attributeFilter: ['class'] });

  if (toggle) toggle.addEventListener('click', openMenu);
  if (toggleButton && toggleButton !== toggle) toggleButton.addEventListener('click', openMenu);
  if (closeButton) closeButton.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      closeMenu();
      if (toggleButton && typeof toggleButton.focus === 'function') toggleButton.focus();
    }
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('.offcanvas-area a') : null;
    if (!link) return;
    closeMenu();
  });

  syncState();
})();
