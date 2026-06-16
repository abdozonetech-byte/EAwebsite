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
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  if (toggleButton) {
    toggleButton.setAttribute('aria-controls', 'mobile-menu');
    toggleButton.setAttribute('aria-expanded', 'false');
  }
  menu.setAttribute('aria-hidden', 'true');

  var observer = new MutationObserver(syncState);
  observer.observe(menu, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      menu.classList.remove('info-open');
      if (overlay) overlay.classList.remove('overlay-open');
      syncState();
      if (toggleButton && typeof toggleButton.focus === 'function') toggleButton.focus();
    }
  });

  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('.offcanvas-area a') : null;
    if (!link) return;
    menu.classList.remove('info-open');
    if (overlay) overlay.classList.remove('overlay-open');
    syncState();
  });

  syncState();
})();
