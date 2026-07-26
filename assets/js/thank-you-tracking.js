(function () {
  'use strict';

  function runConversionTracking() {
    var submitted = false;
    try {
      submitted = sessionStorage.getItem('lead_submitted') === 'true';
    } catch (error) {
      console.warn('Lead tracking session guard could not be read.', error);
    }
    if (!submitted) return;

    if (typeof window.trackEvent === 'function') {
      window.trackEvent('generate_lead', {
        currency: 'MAD',
        value: 0,
        form_name: 'diagnostic_form',
        conversion_location: 'thank_you_page'
      });
      window.trackEvent('consultation_form_success', {
        form_name: 'diagnostic_form',
        conversion_location: 'thank_you_page'
      });
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: 'Diagnostic marketing gratuit',
        content_category: 'Consultation marketing'
      });
    }

    try {
      sessionStorage.removeItem('lead_submitted');
    } catch (error) {
      console.warn('Lead tracking session guard could not be cleared.', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runConversionTracking, { once: true });
  } else {
    runConversionTracking();
  }
}());
