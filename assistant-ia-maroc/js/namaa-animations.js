(function () {
  'use strict';

  // Respect users who prefer reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    try {
      var orb = document.querySelector('.namaa-orb');
      var title = document.getElementById('namaaMainTitle');
      var subtitle = document.getElementById('namaaSubtitle');
      var agentKicker = document.getElementById('namaaAgentKicker');
      var sidebar = document.querySelector('.namaa-sidebar');
      var topbar = document.querySelector('.namaa-topbar');

      // Motion One exposes `motion` in the global scope when loaded via CDN
      if (typeof motion === 'undefined') return;

      if (sidebar) {
        motion.animate(sidebar, { transform: ['translateX(-16px)', 'translateX(0)'], opacity: [0, 1] }, { duration: 0.6, easing: 'ease', delay: 0.05 });
      }

      if (topbar) {
        motion.animate(topbar, { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] }, { duration: 0.5, easing: 'ease', delay: 0.1 });
      }

      if (orb) {
        motion.animate(orb, { scale: [0.6, 1.05, 1], opacity: [0, 1] }, { duration: 0.9, easing: [0.22, 1, 0.36, 1], delay: 0.2 });
      }

      if (agentKicker) {
        motion.animate(agentKicker, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] }, { duration: 0.5, delay: 0.5 });
      }

      if (title) {
        motion.animate(title, { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0)'] }, { duration: 0.7, delay: 0.6 });
      }

      if (subtitle) {
        motion.animate(subtitle, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0)'] }, { duration: 0.6, delay: 0.75 });
      }
    } catch (e) {
      // Fail silently — don't break the page if animation errors
      console.error('Namaa animations error:', e);
    }
  });
})();
