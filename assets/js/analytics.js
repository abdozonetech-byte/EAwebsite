/* Upgrade 07 — Final Tracking & Analytics
 * Privacy-first analytics foundation for Elboubakry static website.
 *
 * Setup needed after deployment:
 * 1) Replace GA4_MEASUREMENT_ID below with the real GA4 ID, for example G-XXXXXXXXXX.
 * 2) Keep values empty for tools you do not use yet. No external analytics script loads while IDs are placeholders.
 * 3) Test with /?ea_debug_tracking=1 and browser console.
 */
(function () {
  'use strict';

  var CONFIG = Object.assign({
    GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX',
    ENABLE_DEBUG: false,
    COOKIE_STORAGE: false,
    TRACK_SCROLL_DEPTHS: [25, 50, 75, 90],
    TRACK_ARTICLE_READ_SECONDS: 45,
    ATTRIBUTION_TTL_DAYS: 90,
    SITE_NAME: 'Elboubakry',
    PRIMARY_CONVERSION_PATH: '/reserver-diagnostic/'
  }, window.EA_TRACKING_CONFIG || {});

  var searchParams = new URLSearchParams(window.location.search);
  var debugMode = CONFIG.ENABLE_DEBUG || searchParams.has('ea_debug_tracking') || searchParams.has('debug_tracking');
  var GA4_PATTERN = /^G-[A-Z0-9]{6,}$/;
  var isRealGa4Id = GA4_PATTERN.test(CONFIG.GA4_MEASUREMENT_ID) && CONFIG.GA4_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
  var scrollDepthSent = Object.create(null);
  var articleTimers = { started: false, completed: false };
  var formStarted = Object.create(null);
  var STORAGE_KEY = 'EA_ATTRIBUTION_V1';
  var SESSION_KEY = 'EA_SESSION_V1';
  var ORIGINAL_FETCH = window.fetch;

  function log() {
    if (!debugMode || !window.console) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[EA Tracking]');
    console.info.apply(console, args);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function safeJsonParse(value) {
    try { return JSON.parse(value); } catch (error) { return null; }
  }

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (error) { return null; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) {}
  }

  function sessionGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (error) { return null; }
  }

  function sessionSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (error) {}
  }

  function cleanText(value, limit) {
    return (value || '').replace(/\s+/g, ' ').trim().slice(0, limit || 140);
  }

  function cleanPath(path) {
    return (path || window.location.pathname || '/').replace(/\/index\.html$/, '/');
  }

  function pagePath() {
    return cleanPath(window.location.pathname) + window.location.search + window.location.hash;
  }

  function pageUrl(href) {
    try { return new URL(href || window.location.href, window.location.href); } catch (error) { return null; }
  }

  function pageType() {
    var path = cleanPath(window.location.pathname);
    if (path === '/' || path === '') return 'homepage';
    if (path === '/insights/') return 'insights_hub';
    if (/^\/insights\/[^/]+\.html$/.test(path)) return 'insight_article';
    if (path === '/reserver-diagnostic/') return 'lead_page';
    if (path === '/merci/') return 'thank_you';
    if (/about-elboubakry-abdessamad\.html$/.test(path)) return 'about';
    return 'page';
  }

  function pageTitle() {
    var h1 = document.querySelector('h1');
    return cleanText(h1 ? h1.textContent : document.title, 160);
  }

  function slugFromPath(pathname) {
    var parts = cleanPath(pathname || window.location.pathname).split('/').filter(Boolean);
    var last = parts.pop() || 'home';
    return last.replace(/\.html$/, '') || 'home';
  }

  function getSession() {
    var stored = safeJsonParse(sessionGet(SESSION_KEY));
    if (stored && stored.session_id) return stored;
    var created = {
      session_id: 'EA-S-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      started_at: nowIso(),
      landing_page: window.location.href,
      referrer: document.referrer || ''
    };
    sessionSet(SESSION_KEY, JSON.stringify(created));
    return created;
  }

  function buildAttribution() {
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'msclkid', 'ttclid'];
    var current = {};
    keys.forEach(function (key) {
      var value = searchParams.get(key);
      if (value) current[key] = value.slice(0, 180);
    });

    var existing = safeJsonParse(storageGet(STORAGE_KEY)) || {};
    var hasCurrent = Object.keys(current).length > 0;
    var ageLimitMs = (CONFIG.ATTRIBUTION_TTL_DAYS || 90) * 24 * 60 * 60 * 1000;
    var existingAgeMs = existing.updated_at ? Date.now() - new Date(existing.updated_at).getTime() : Infinity;

    if (hasCurrent || !existing.first_touch || existingAgeMs > ageLimitMs) {
      var next = Object.assign({}, existing, current, {
        last_touch_url: window.location.href,
        last_referrer: document.referrer || existing.last_referrer || '',
        updated_at: nowIso()
      });
      if (!next.first_touch) next.first_touch = window.location.href;
      if (!next.first_referrer) next.first_referrer = document.referrer || '';
      if (!next.created_at) next.created_at = nowIso();
      storageSet(STORAGE_KEY, JSON.stringify(next));
      return next;
    }
    return existing;
  }

  var session = getSession();
  var attribution = buildAttribution();

  function baseParams(extra) {
    return Object.assign({
      page_title: pageTitle(),
      page_path: pagePath(),
      page_location: window.location.href,
      page_type: pageType(),
      session_id: session.session_id,
      traffic_source: attribution.utm_source || '',
      traffic_medium: attribution.utm_medium || '',
      traffic_campaign: attribution.utm_campaign || '',
      referrer: document.referrer || '',
      transport_type: 'beacon'
    }, extra || {});
  }

  function setupDataLayer() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  }

  function loadGa4() {
    setupDataLayer();
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: CONFIG.COOKIE_STORAGE ? 'granted' : 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
    window.gtag('js', new Date());

    if (!isRealGa4Id) {
      log('GA4 placeholder detected. External Google Analytics script was not loaded.', CONFIG.GA4_MEASUREMENT_ID);
      return;
    }

    window.gtag('config', CONFIG.GA4_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: 'SameSite=Lax;Secure',
      client_storage: CONFIG.COOKIE_STORAGE ? 'cookie' : 'none'
    });

    if (!document.querySelector('script[data-ea-ga4]')) {
      var tagScript = document.createElement('script');
      tagScript.async = true;
      tagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.GA4_MEASUREMENT_ID);
      tagScript.setAttribute('data-ea-ga4', 'true');
      document.head.appendChild(tagScript);
    }
  }

  function trackEvent(eventName, parameters) {
    var params = baseParams(parameters || {});
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
    window.dispatchEvent(new CustomEvent('ea:tracking-event', {
      detail: { event: eventName, parameters: params }
    }));
    log(eventName, params);
  }

  function trackPageView() {
    trackEvent('page_view', {
      page_referrer: document.referrer || '',
      content_group: pageType(),
      article_slug: pageType() === 'insight_article' ? slugFromPath() : undefined
    });
  }

  function locationFromElement(element) {
    if (!element) return 'content';
    if (element.dataset && element.dataset.trackLocation) return element.dataset.trackLocation;
    if (element.closest('.rs-banner-one, .hero, [data-section="hero"]')) return 'hero';
    if (element.closest('header, .header-area, .main-menu')) return 'header';
    if (element.closest('.offcanvas-area, .mobile-menu')) return 'mobile_menu';
    if (element.closest('#portfolio, .ea-portfolio, .portfolio')) return 'portfolio';
    if (element.closest('#services, .services')) return 'services';
    if (element.closest('#systems, .systems, .ea-system')) return 'systems';
    if (element.closest('.ea-insights, .ea-insights-grid, .insights')) return 'insights';
    if (element.closest('.ea-article-cta, .article-cta')) return 'article_cta';
    if (element.closest('#footer-contact, footer, .ea-footer')) return 'footer';
    if (element.closest('form')) return 'form';
    return 'content';
  }

  function ctaTypeFromHref(href) {
    if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp';
    if (/^mailto:/i.test(href)) return 'email';
    if (/linkedin\.com/i.test(href)) return 'linkedin';
    if (/instagram\.com/i.test(href)) return 'instagram';
    if (/reserver-diagnostic/i.test(href)) return 'diagnostic';
    if (/insights/i.test(href)) return 'insights';
    if (/^#|\/#/.test(href)) return 'anchor';
    return 'internal';
  }

  function handleClick(event) {
    var target = event.target.closest('a, button, [role="button"], [data-track-event]');
    if (!target) return;
    var href = target.getAttribute('href') || '';
    var text = cleanText(target.dataset.trackLabel || target.textContent || target.getAttribute('aria-label') || href, 120);
    var location = locationFromElement(target);
    var explicitEvent = target.dataset.trackEvent;
    var url = pageUrl(href);
    var type = ctaTypeFromHref(href);

    if (explicitEvent) {
      trackEvent(explicitEvent, { location: location, button_text: text, cta_type: type, target_url: href });
      return;
    }

    if (type === 'diagnostic') {
      trackEvent('diagnostic_cta_click', { location: location, button_text: text, target_url: url ? url.pathname : href });
    } else if (type === 'whatsapp') {
      trackEvent('whatsapp_click', { location: location, button_text: text, target_url: href });
    } else if (type === 'email') {
      trackEvent('email_click', { location: location, button_text: text });
    } else if (type === 'linkedin' || type === 'instagram') {
      trackEvent('social_click', { location: location, social_network: type, button_text: text, target_url: href });
    } else if (url && url.origin === window.location.origin) {
      if (/^\/insights\/[^/]+\.html$/.test(url.pathname)) {
        trackEvent('insight_article_click', {
          location: location,
          article_slug: slugFromPath(url.pathname),
          link_text: text,
          target_page: url.pathname
        });
      } else {
        trackEvent('internal_link_click', { location: location, link_text: text, target_page: url.pathname + url.hash });
      }
    }
  }

  function formName(form) {
    return form.getAttribute('name') || form.id || form.dataset.formName || (pageType() === 'lead_page' ? 'diagnostic_form' : 'form');
  }

  function handleFormInteraction(event) {
    var field = event.target;
    var form = field && field.closest ? field.closest('form') : null;
    if (!form) return;
    var name = formName(form);
    if (formStarted[name]) return;
    formStarted[name] = true;
    trackEvent('form_start', { form_name: name, location: locationFromElement(form) });
  }

  function handleSubmit(event) {
    var form = event.target;
    if (!form || form.tagName !== 'FORM') return;
    var name = formName(form);
    trackEvent('lead_submit_attempt', {
      form_name: name,
      location: locationFromElement(form),
      valid_at_submit: typeof form.checkValidity === 'function' ? form.checkValidity() : undefined
    });
  }

  function hookFetchForLeadEndpoint() {
    if (typeof ORIGINAL_FETCH !== 'function' || window.__eaFetchHooked) return;
    window.__eaFetchHooked = true;
    window.fetch = function () {
      var args = Array.prototype.slice.call(arguments);
      var target = args[0];
      var url = typeof target === 'string' ? target : (target && target.url ? target.url : '');
      var isLeadEndpoint = /https:\/\/script\.google\.com\/macros\/s\/.+\/exec/i.test(url || '');
      if (isLeadEndpoint) {
        trackEvent('lead_request_sent', {
          form_name: 'diagnostic_form',
          endpoint_type: 'google_apps_script',
          location: 'lead_page'
        });
      }
      return ORIGINAL_FETCH.apply(this, args).then(function (response) {
        if (isLeadEndpoint) {
          trackEvent('lead_request_completed', {
            form_name: 'diagnostic_form',
            endpoint_type: 'google_apps_script',
            location: 'lead_page',
            request_status: response && response.ok === false ? 'not_ok' : 'sent'
          });
        }
        return response;
      }).catch(function (error) {
        if (isLeadEndpoint) {
          trackEvent('lead_request_error', {
            form_name: 'diagnostic_form',
            endpoint_type: 'google_apps_script',
            location: 'lead_page',
            error_name: error && error.name ? error.name : 'error'
          });
        }
        throw error;
      });
    };
  }

  function handleCustomLeadEvents() {
    window.addEventListener('ea:lead-test-sent', function (event) {
      trackEvent('lead_test_sent', Object.assign({ form_name: 'diagnostic_test_panel' }, event.detail || {}));
    });
    window.addEventListener('ea:lead-test-error', function (event) {
      trackEvent('lead_test_error', Object.assign({ form_name: 'diagnostic_test_panel' }, event.detail || {}));
    });
  }

  function handleScrollDepth() {
    var doc = document.documentElement;
    var scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
    var percent = Math.round((window.scrollY / scrollable) * 100);
    (CONFIG.TRACK_SCROLL_DEPTHS || [25, 50, 75, 90]).forEach(function (threshold) {
      if (percent >= threshold && !scrollDepthSent[threshold]) {
        scrollDepthSent[threshold] = true;
        trackEvent('scroll_depth', { percent_scrolled: threshold });
      }
    });
  }

  function setupArticleEngagement() {
    if (pageType() !== 'insight_article') return;
    if (!articleTimers.started) {
      articleTimers.started = true;
      trackEvent('article_read_start', { article_slug: slugFromPath(), article_title: pageTitle() });
    }
    window.setTimeout(function () {
      if (!articleTimers.completed) {
        articleTimers.completed = true;
        trackEvent('article_engaged_read', {
          article_slug: slugFromPath(),
          article_title: pageTitle(),
          seconds: CONFIG.TRACK_ARTICLE_READ_SECONDS || 45
        });
      }
    }, (CONFIG.TRACK_ARTICLE_READ_SECONDS || 45) * 1000);
  }

  function setupDebugPanel() {
    if (!debugMode || document.querySelector('.ea-tracking-debug')) return;
    var panel = document.createElement('div');
    panel.className = 'ea-tracking-debug';
    panel.style.cssText = 'position:fixed;z-index:99999;right:12px;bottom:12px;max-width:340px;padding:12px 14px;border:1px solid rgba(37,99,235,.25);border-radius:16px;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,.14);font:12px/1.45 system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a';
    panel.innerHTML = '<strong style="display:block;margin-bottom:6px;color:#0b55ff">EA Tracking Debug</strong>' +
      '<div>GA4: ' + (isRealGa4Id ? 'Configured' : 'Placeholder / not loaded') + '</div>' +
      '<div>Page type: ' + pageType() + '</div>' +
      '<div>Session: ' + session.session_id + '</div>' +
      '<button type="button" style="margin-top:8px;border:0;border-radius:999px;background:#0b55ff;color:#fff;padding:7px 10px;font-weight:800;cursor:pointer">Send test event</button>';
    panel.querySelector('button').addEventListener('click', function () {
      trackEvent('tracking_debug_test', { location: 'debug_panel' });
    });
    document.body.appendChild(panel);
  }

  function init() {
    loadGa4();
    hookFetchForLeadEndpoint();
    handleCustomLeadEvents();
    window.EA_ANALYTICS = Object.freeze({
      version: 'upgrade-07-final-tracking',
      trackEvent: trackEvent,
      getAttribution: function () { return Object.assign({}, attribution); },
      getSession: function () { return Object.assign({}, session); },
      config: Object.assign({}, CONFIG),
      ga4Configured: isRealGa4Id
    });

    document.addEventListener('click', handleClick, true);
    document.addEventListener('focusin', handleFormInteraction, true);
    document.addEventListener('input', handleFormInteraction, true);
    document.addEventListener('submit', handleSubmit, true);
    window.addEventListener('scroll', handleScrollDepth, { passive: true });

    trackPageView();
    setupArticleEngagement();
    setupDebugPanel();
    log('Initialized', window.EA_ANALYTICS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
