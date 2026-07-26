/**
 * Elboubakry first-party tracking layer.
 * Preserves GA4 event tracking, Meta Pixel compatibility, UTM attribution and
 * conversion events. Identifiers are configured in tracking-config.js.
 */
(function () {
  'use strict';

  var config = window.ELBOUBAKRY_TRACKING || {};
  var GA_MEASUREMENT_ID = config.GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX';
  var META_PIXEL_ID = config.META_PIXEL_ID || 'PASTE_META_PIXEL_ID_HERE';
  var ENABLE_GA4 = config.ENABLE_GA4 !== false;
  var ENABLE_META_PIXEL = config.ENABLE_META_PIXEL !== false;
  var IMPORTANT_INTERNAL_PATHS = [
    '/#footer-contact',
    '/reserver-diagnostic/',
    '/about-elboubakry-abdessamad.html',
    '/insights/',
    '/insights/strategie-marketing-digital-maroc.html',
    '/insights/publicite-digitale-maroc-meta-google-tiktok.html',
    '/insights/landing-page-generation-leads-maroc.html',
    '/insights/generation-leads-qualifies-maroc.html',
    '/insights/seo-maroc-visibilite-entreprise.html',
    '/insights/analytics-tracking-marketing-maroc.html',
    '/insights/automatisation-marketing-maroc.html',
    '/insights/consultant-marketing-digital-maroc.html',
    '/insights/consultant-marketing-digital-casablanca.html'
  ];
  var SERVICE_PAGES = {
    'strategie-marketing-digital-maroc': 'strategie_marketing_digital',
    'publicite-digitale-maroc-meta-google-tiktok': 'publicite_digitale',
    'landing-page-generation-leads-maroc': 'landing_page_generation_leads',
    'generation-leads-qualifies-maroc': 'generation_leads_qualifies',
    'seo-content-strategy-maroc': 'seo_content_strategy',
    'seo-maroc-visibilite-entreprise': 'seo_maroc',
    'analytics-tracking-marketing-maroc': 'analytics_tracking',
    'automatisation-marketing-maroc': 'automatisation_marketing',
    'consultant-marketing-digital-maroc': 'consultant_marketing_digital_maroc',
    'consultant-marketing-digital-casablanca': 'consultant_marketing_digital_casablanca'
  };
  var scrollDepthSent = {};
  var formStarted = new WeakSet();

  function isGaPlaceholder() {
    return !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX' || !/^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID);
  }

  function isMetaPlaceholder() {
    return !META_PIXEL_ID || META_PIXEL_ID === 'PASTE_META_PIXEL_ID_HERE' || !/^\d{8,20}$/.test(String(META_PIXEL_ID));
  }

  function loadGoogleTag() {
    if (window.__elboubakryAnalyticsLoaded || !ENABLE_GA4) return;
    window.__elboubakryAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: true,
      linker: { domains: ['elboubakry.com'] }
    });
    window.__elboubakryAnalyticsMeasurementId = GA_MEASUREMENT_ID;
    if (isGaPlaceholder()) return;
    var tagScript = document.createElement('script');
    tagScript.async = true;
    tagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(tagScript);
  }

  function loadMetaPixel() {
    if (window.__elboubakryMetaLoaded || !ENABLE_META_PIXEL || isMetaPlaceholder()) return;
    window.__elboubakryMetaLoaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    window.__elboubakryMetaPixelId = META_PIXEL_ID;
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
    if (element.dataset && element.dataset.trackLocation) return element.dataset.trackLocation;
    if (element.closest('.rs-banner-one, .hero')) return 'hero';
    if (element.closest('#footer-contact, footer')) return 'footer';
    if (element.closest('#homecontact')) return 'homepage_contact';
    if (element.closest('.ea-article-hero')) return 'article_hero';
    if (element.closest('.ea-article-cta')) return 'article_cta';
    if (element.closest('.ea-insights-cta')) return 'insights_cta';
    if (element.closest('.ea-article-side-card')) return 'sidebar';
    if (element.closest('.offcanvas-area')) return 'mobile_menu';
    if (element.closest('header')) return 'header';
    return 'content';
  }

  function ctaTypeFromHref(href) {
    if (/linkedin\.com/i.test(href)) return 'linkedin';
    if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp';
    if (/^mailto:/i.test(href)) return 'email';
    if (/reserver-diagnostic/i.test(href)) return 'diagnostic';
    if (/footer-contact|homecontact/i.test(href)) return 'consultation';
    return 'internal';
  }

  function isImportantInternalLink(link) {
    var href = link.getAttribute('href') || '';
    if (!href || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) return false;
    var url = pageUrl(href);
    if (!url || url.origin !== window.location.origin) return false;
    var target = url.pathname + url.hash;
    return IMPORTANT_INTERNAL_PATHS.some(function (path) {
      return target === path || target.endsWith(path);
    }) || /\/insights\/.+\.html$/.test(url.pathname);
  }

  function trackEvent(eventName, parameters) {
    var payload = Object.assign({
      page_path: pagePath(),
      page_title: pageTitle(),
      transport_type: 'beacon'
    }, parameters || {});
    if (ENABLE_GA4 && typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
    window.dispatchEvent(new CustomEvent('elboubakry:tracking', {
      detail: { event: eventName, parameters: payload }
    }));
  }

  function trackScopedCta(text, href) {
    var slug = slugFromPath();
    if (!SERVICE_PAGES[slug]) return;
    trackEvent('service_cta_click', {
      service_slug: SERVICE_PAGES[slug],
      service_name: pageTitle(),
      cta_type: ctaTypeFromHref(href),
      button_text: text
    });
  }

  function trackedEventForLink(link, href) {
    var explicitEvent = link.dataset ? link.dataset.trackEvent : '';
    if (explicitEvent) return explicitEvent;
    if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp_click';
    if (/linkedin\.com/i.test(href)) return 'linkedin_click';
    if (/^mailto:/i.test(href)) return 'email_click';
    if (/^tel:/i.test(href)) return 'phone_click';
    if (/reserver-diagnostic/i.test(href)) return 'diagnostic_cta_click';
    return '';
  }

  function handleTrackedClick(event) {
    var link = event.target.closest('a, button, [data-track-event]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var text = cleanText((link.dataset && link.dataset.trackLabel) || link.textContent || link.getAttribute('aria-label') || href);
    var location = locationFromElement(link);
    var trackedEvent = trackedEventForLink(link, href);

    if (trackedEvent) {
      trackEvent(trackedEvent, {
        location: location,
        button_text: text || trackedEvent,
        link_url: href
      });
      trackScopedCta(text, href);
    }

    var url = pageUrl(href);
    if (url && url.origin !== window.location.origin && !/^(mailto:|tel:)/i.test(href)) {
      trackEvent('outbound_click', {
        link_url: url.href,
        link_text: text,
        location: location
      });
    }

    if (isImportantInternalLink(link)) {
      trackEvent('internal_link_click', {
        target_page: url ? url.pathname + url.hash : href,
        location: location,
        link_text: text
      });
    }
  }

  function handleFormStart(event) {
    var form = event.target && event.target.closest ? event.target.closest('form') : null;
    if (!form || formStarted.has(form)) return;
    formStarted.add(form);
    trackEvent('form_start', {
      form_name: form.getAttribute('name') || form.id || 'contact_form',
      location: locationFromElement(form)
    });
  }

  function hasRequiredContactMethod(form) {
    if (!form.hasAttribute('data-custom-validation')) return true;
    var phoneField = form.querySelector('[name="phone"]');
    var emailField = form.querySelector('[name="email"]');
    return Boolean((phoneField && cleanText(phoneField.value)) || (emailField && cleanText(emailField.value)));
  }

  function handleFormSubmit(event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM' || form.hasAttribute('data-defer-submit-tracking')) return;
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
        trackEvent('scroll_depth', { percent: threshold });
      }
    });
  }

  loadGoogleTag();
  loadMetaPixel();
  window.trackEvent = trackEvent;
  window.elboubakryTracking = {
    ga4Configured: !isGaPlaceholder(),
    metaConfigured: !isMetaPlaceholder(),
    ga4MeasurementId: GA_MEASUREMENT_ID,
    metaPixelId: META_PIXEL_ID
  };
  document.addEventListener('click', handleTrackedClick, true);
  document.addEventListener('focusin', handleFormStart, true);
  document.addEventListener('submit', handleFormSubmit, true);
  window.addEventListener('scroll', handleScrollDepth, { passive: true });
}());
