/* Upgrade 05 — small performance helpers, no UI change. */
(function () {
  'use strict';
  var prefetched = false;
  function prefetchDiagnostic() {
    if (prefetched || !document.head) return;
    prefetched = true;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/reserver-diagnostic/';
    link.as = 'document';
    document.head.appendChild(link);
  }
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(prefetchDiagnostic, { timeout: 3500 });
  } else {
    window.setTimeout(prefetchDiagnostic, 2500);
  }
})();
