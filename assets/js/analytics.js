/* Elboubakry analytics foundation.
 * TODO: Replace G-XXXXXXXXXX with the real GA4 Measurement ID from Google Analytics.
 * TODO: Add a privacy/cookie notice before production launch if required by the final deployment/legal context.
 */
(function () {
  'use strict';

  var GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  var IMPORTANT_INTERNAL_PATHS = [
    '/#footer-contact',
    '/reserver-diagnostic/',
    '/about-elboubakry-abdessamad.html',
    '/insights/',
    '/insights/strategie-marketing-digital-maroc.html',
    '/insights/publicite-digitale-maroc-meta-google-tiktok.html',
    '/insights/landing-page-generation-leads-maroc.html',
    '/insights/seo-content-strategy-maroc.html',
    '/insights/analytics-tracking-marketing-maroc.html',
    '/insights/automatisation-marketing-maroc.html',
    '/insights/consultant-marketing-digital-maroc.html',
    '/insights/consultant-marketing-digital-casablanca.html'
  ];
  var SERVICE_PAGES = {
    'strategie-marketing-digital-maroc': 'strategie_marketing_digital',
    'publicite-digitale-maroc-meta-google-tiktok': 'publicite_digitale',
    'landing-page-generation-leads-maroc': 'landing_page_generation_leads',
    'seo-content-strategy-maroc': 'seo_content_strategy',
    'analytics-tracking-marketing-maroc': 'analytics_tracking',
    'automatisation-marketing-maroc': 'automatisation_marketing',
    'consultant-marketing-digital-maroc': 'consultant_marketing_digital_maroc',
    'consultant-marketing-digital-casablanca': 'consultant_marketing_digital_casablanca'
  };
  var scrollDepthSent = {};

  function isPlaceholderMeasurementId() {
    return GA_MEASUREMENT_ID === 'G-XXXXXXXXXX';
  }

  function loadGoogleTag() {
    if (window.__elboubakryAnalyticsLoaded) return;
    window.__elboubakryAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true
    });
    window.__elboubakryAnalyticsMeasurementId = GA_MEASUREMENT_ID;
    if (isPlaceholderMeasurementId()) return;
    var tagScript = document.createElement('script');
    tagScript.async = true;
    tagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(tagScript);
  }

  function cleanText(value) {
    return (value || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  function pagePath() {
    return window.location.pathname + window.location.hash;
  }

  function pageUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (error) {
      return null;
    }
  }

  function slugFromPath() {
    var file = window.location.pathname.split('/').pop() || '';
    return file.replace(/\.html$/, '');
  }

  function pageTitle() {
    var heading = document.querySelector('h1');
    return cleanText(heading ? heading.textContent : document.title);
  }

  function locationFromElement(element) {
    if (element.dataset.trackLocation) return element.dataset.trackLocation;
    if (element.closest('.rs-banner-one')) return 'hero';
    if (element.closest('#footer-contact')) return 'footer_contact';
    if (element.closest('#homecontact')) return 'homepage_contact';
    if (element.closest('.ea-article-hero')) return 'article_hero';
    if (element.closest('.ea-article-cta')) return 'article_cta';
    if (element.closest('.ea-insights-cta')) return 'insights_cta';
    if (element.closest('.ea-article-side-card')) return 'sidebar';
    if (element.closest('.offcanvas-area')) return 'mobile_menu';
    if (element.closest('.ea-footer, footer')) return 'footer';
    if (element.closest('header')) return 'header';
    return 'content';
  }

  function ctaTypeFromHref(href) {
    if (/linkedin\.com/i.test(href)) return 'linkedin';
    if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp';
    if (/^mailto:/i.test(href)) return 'email';
    if (/reserver-diagnostic/i.test(href)) return 'diagnostic';
    if (/homecontact/i.test(href)) return 'consultation';
    return 'internal';
  }

  function isImportantInternalLink(link) {
    var href = link.getAttribute('href') || '';
    if (!href || /^(mailto:|tel:|sms:)/i.test(href)) {
      return false;
    }
    var url = pageUrl(href);
    if (!url) return false;
    if (url.origin !== window.location.origin) {
      return false;
    }
    var target = url.pathname + url.hash;
    return IMPORTANT_INTERNAL_PATHS.some(function (path) {
      return target === path || target.endsWith(path);
    }) || /\/insights\/.+\.html$/.test(url.pathname);
  }

  function trackEvent(eventName, parameters) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, Object.assign({
      page_path: pagePath(),
      transport_type: 'beacon'
    }, parameters || {}));
  }

  function trackScopedCta(link, text, href) {
    var slug = slugFromPath();
    var ctaType = ctaTypeFromHref(href);
    if (SERVICE_PAGES[slug]) {
      trackEvent('service_cta_click', {
        service_slug: SERVICE_PAGES[slug],
        service_name: pageTitle(),
        cta_type: ctaType,
        button_text: text
      });
      return;
    }
    if (/\/light\/insights\//.test(window.location.pathname)) {
      trackEvent('article_cta_click', {
        article_slug: slug,
        article_title: pageTitle(),
        cta_type: ctaType,
        button_text: text
      });
    }
  }

  function isConsultationLink(href, text, explicitEvent) {
    return explicitEvent === 'consultation_click' || /homecontact/i.test(href) || /consultation|diagnostic|contact|discut/i.test(text);
  }

  function isDiagnosticPageLink(href, explicitEvent) {
    return explicitEvent === 'diagnostic_cta_click' || /reserver-diagnostic/i.test(href);
  }

  function trackedEventForLink(link, href) {
    var explicitEvent = link.dataset.trackEvent;
    if (explicitEvent) return explicitEvent;
    if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp_click';
    if (/linkedin\.com/i.test(href)) return 'linkedin_click';
    if (/^mailto:/i.test(href)) return 'email_click';
    return '';
  }

  function targetPage(link) {
    var href = link.getAttribute('href') || '';
    var url = pageUrl(href);
    if (!url) return href;
    return url.pathname + url.hash;
  }

  function handleTrackedClick(event) {
    var link = event.target.closest('a, button, [data-track-event]');
    if (!link) return;
    var explicitEvent = link.dataset.trackEvent;
    var href = link.getAttribute('href') || '';
    var text = cleanText(link.dataset.trackLabel || link.textContent || link.getAttribute('aria-label') || href);
    var location = locationFromElement(link);
    var trackedEvent = trackedEventForLink(link, href);

    if (trackedEvent) {
      trackEvent(trackedEvent, {
        location: location,
        button_text: text || trackedEvent
      });
      trackScopedCta(link, text, href);
    } else if (isDiagnosticPageLink(href, explicitEvent)) {
      trackEvent('diagnostic_cta_click', {
        location: location,
        button_text: text || 'diagnostic'
      });
      trackScopedCta(link, text, href);
    } else if (isConsultationLink(href, text, explicitEvent)) {
      trackEvent('consultation_click', {
        location: location,
        button_text: text || 'consultation'
      });
      trackScopedCta(link, text, href);
    }

    if (isImportantInternalLink(link)) {
      trackEvent('internal_link_click', {
        target_page: targetPage(link),
        location: location,
        link_text: text || targetPage(link)
      });
    }
  }

  function hasRequiredContactMethod(form) {
    if (!form.hasAttribute('data-custom-validation')) return true;
    var phoneField = form.querySelector('[name="phone"]');
    var emailField = form.querySelector('[name="email"]');
    var hasPhone = phoneField && cleanText(phoneField.value).length > 0;
    var hasEmail = emailField && cleanText(emailField.value).length > 0;
    return hasPhone || hasEmail;
  }

  function handleFormSubmit(event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') return;
    if (form.hasAttribute('data-defer-submit-tracking')) return;
    if (typeof form.checkValidity === 'function' && !form.checkValidity()) return;
    if (!hasRequiredContactMethod(form)) return;
    trackEvent(form.hasAttribute('data-whatsapp-lead') ? 'consultation_whatsapp_submit' : 'contact_form_submit', {
      form_name: form.getAttribute('name') || form.id || 'contact_form',
      location: locationFromElement(form)
    });
  }

  function handleScrollDepth() {
    var doc = document.documentElement;
    var scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
    var percent = Math.round((window.scrollY / scrollable) * 100);
    [50, 90].forEach(function (threshold) {
      if (percent >= threshold && !scrollDepthSent[threshold]) {
        scrollDepthSent[threshold] = true;
        trackEvent('scroll_depth', {
          percent: threshold
        });
      }
    });
  }

  loadGoogleTag();
  window.trackEvent = trackEvent;
  document.addEventListener('click', handleTrackedClick, true);
  document.addEventListener('submit', handleFormSubmit, true);
  window.addEventListener('scroll', handleScrollDepth, { passive: true });
})();
