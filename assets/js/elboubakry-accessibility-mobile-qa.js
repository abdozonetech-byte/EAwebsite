/* Upgrade 08 — Accessibility + Final Mobile QA
   Small progressive enhancements only. No visual redesign. */
(function () {
  'use strict';

  var doc = document;

  function ensureMainTarget() {
    var main = doc.querySelector('main');
    if (!main) return;
    if (!main.id) main.id = 'main-content';
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  }

  function addAriaCurrent() {
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    doc.querySelectorAll('nav a[href], header a[href], footer a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.indexOf('#') === 0) return;
      var url;
      try { url = new URL(href, window.location.origin); } catch (e) { return; }
      if (url.origin !== window.location.origin) return;
      var target = url.pathname.replace(/\/+$/, '') || '/';
      if (target === path) link.setAttribute('aria-current', 'page');
    });
  }

  function hardenExternalLinks() {
    doc.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener', 'noreferrer'].forEach(function (token) {
        if (rel.indexOf(token) === -1) rel.push(token);
      });
      link.setAttribute('rel', rel.join(' '));
    });
  }

  function labelIconOnlyLinks() {
    doc.querySelectorAll('a[href]').forEach(function (link) {
      if (link.getAttribute('aria-label')) return;
      var text = (link.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) return;
      var href = link.getAttribute('href') || '';
      var label = '';
      if (href === '/' || href === '#') label = 'Accueil';
      else if (href.indexOf('linkedin') !== -1) label = 'Profil LinkedIn';
      else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) label = 'Contacter sur WhatsApp';
      else if (href.indexOf('mailto:') === 0) label = 'Envoyer un email';
      else label = 'Ouvrir le lien';
      link.setAttribute('aria-label', label);
    });
  }

  function improveFormState() {
    doc.querySelectorAll('input, textarea, select').forEach(function (field) {
      if (!field.hasAttribute('autocomplete')) {
        var name = (field.getAttribute('name') || field.getAttribute('id') || '').toLowerCase();
        if (name.indexOf('email') !== -1) field.setAttribute('autocomplete', 'email');
        if (name.indexOf('phone') !== -1 || name.indexOf('tel') !== -1) field.setAttribute('autocomplete', 'tel');
        if (name.indexOf('nom') !== -1 || name.indexOf('name') !== -1) field.setAttribute('autocomplete', 'name');
        if (name.indexOf('entreprise') !== -1 || name.indexOf('company') !== -1) field.setAttribute('autocomplete', 'organization');
      }
    });
  }

  function markKeyboardMode() {
    function onFirstTab(event) {
      if (event.key !== 'Tab') return;
      doc.documentElement.classList.add('ea-keyboard-user');
      window.removeEventListener('keydown', onFirstTab);
    }
    window.addEventListener('keydown', onFirstTab);
    window.addEventListener('mousedown', function () {
      doc.documentElement.classList.remove('ea-keyboard-user');
    }, { passive: true });
  }

  function init() {
    ensureMainTarget();
    addAriaCurrent();
    hardenExternalLinks();
    labelIconOnlyLinks();
    improveFormState();
    markKeyboardMode();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
