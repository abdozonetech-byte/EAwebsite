/* Upgrade 06 — Lead Page + Google Sheet Verification
   Non-invasive helper: does not change the public UI unless /reserver-diagnostic/?lead_debug=1 is used.
   It exposes a safe test panel for Google Sheet delivery checks and records clear diagnostics in the console. */
(function () {
  'use strict';

  var DEFAULT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw83pfpcjAKSgY3wLAzU9QJufvHwdK-Aj-ohZUZsyB8PnRBt_qJrNWYb8WwpJftOqeJ/exec';
  var meta = document.querySelector('meta[name="lead:google_apps_script_url"]');
  var endpoint = (meta && meta.content ? meta.content : DEFAULT_ENDPOINT).trim();
  var search = new URLSearchParams(window.location.search);
  var debugEnabled = search.has('lead_debug') || search.has('lead-test') || search.has('debug_lead');

  function isConfigured() {
    return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);
  }

  function getUtm(name) {
    return search.get(name) || '';
  }

  function leadId() {
    return 'EA-TEST-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function basePayload(overrides) {
    var payload = Object.assign({
      leadId: leadId(),
      submittedAt: new Date().toISOString(),
      formVersion: 'upgrade-06-lead-verification',
      trackingVersion: window.EA_ANALYTICS ? window.EA_ANALYTICS.version : '',
      fullName: 'TEST LEAD - Elboubakry Website',
      phone: '212600000000',
      phoneRaw: '0600000000',
      email: 'test@elboubakry.com',
      businessSector: 'Test Google Sheet',
      message: 'TEST ONLY - This lead was sent from /reserver-diagnostic/?lead_debug=1 to verify Google Sheet delivery. You can delete this row after verification.',
      preferredContact: 'WhatsApp',
      source: 'Lead Debug Test',
      status: 'Test',
      priority: 'Low',
      consent: 'Internal test submission for Google Sheet verification.',
      utm_source: getUtm('utm_source'),
      utm_medium: getUtm('utm_medium'),
      utm_campaign: getUtm('utm_campaign'),
      utm_content: getUtm('utm_content'),
      utm_term: getUtm('utm_term'),
      fbclid: getUtm('fbclid'),
      gclid: getUtm('gclid'),
      referrer: document.referrer || '',
      landingPageUrl: window.location.href,
      adClickId: getUtm('gclid') || getUtm('fbclid') || '',
      pagePath: window.location.pathname,
      language: navigator.language || '',
      timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
      screenSize: (window.screen ? window.screen.width + 'x' + window.screen.height : ''),
      userAgent: navigator.userAgent || '',
      attributionJson: window.EA_ANALYTICS ? JSON.stringify(window.EA_ANALYTICS.getAttribution()) : '',
      analyticsSessionJson: window.EA_ANALYTICS ? JSON.stringify(window.EA_ANALYTICS.getSession()) : ''
    }, overrides || {});

    return payload;
  }

  function submitWithIframe(payload) {
    return new Promise(function (resolve) {
      var frameName = 'ea-lead-debug-frame-' + Date.now();
      var iframe = document.createElement('iframe');
      var form = document.createElement('form');
      var done = false;

      iframe.name = frameName;
      iframe.title = 'Google Sheet lead debug submission';
      iframe.style.display = 'none';

      form.method = 'POST';
      form.action = endpoint;
      form.target = frameName;
      form.style.display = 'none';

      Object.keys(payload).forEach(function (key) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payload[key] == null ? '' : String(payload[key]);
        form.appendChild(input);
      });

      function finish(method) {
        if (done) return;
        done = true;
        window.setTimeout(function () {
          form.remove();
          iframe.remove();
        }, 1200);
        resolve({ method: method || 'iframe', sent: true, endpoint: endpoint });
      }

      iframe.addEventListener('load', function () {
        window.setTimeout(function () { finish('iframe'); }, 400);
      }, { once: true });

      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();
      window.setTimeout(function () { finish('iframe-timeout'); }, 2800);
    });
  }

  async function sendTestLead(extra) {
    if (!isConfigured()) {
      throw new Error('Google Apps Script endpoint is missing or invalid. It must end with /exec.');
    }

    var payload = basePayload(extra);
    var body = new URLSearchParams(payload);

    try {
      var controller = new AbortController();
      var timeout = window.setTimeout(function () { controller.abort(); }, 6500);
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        body: body,
        signal: controller.signal
      });
      window.clearTimeout(timeout);
      return { method: 'fetch-no-cors', sent: true, endpoint: endpoint, payload: payload };
    } catch (error) {
      var fallback = await submitWithIframe(payload);
      fallback.payload = payload;
      fallback.warning = error && error.message ? error.message : String(error);
      return fallback;
    }
  }

  function addDebugPanel() {
    if (!debugEnabled || document.querySelector('.ea-lead-debug-panel')) return;

    var panel = document.createElement('section');
    panel.className = 'ea-lead-debug-panel';
    panel.setAttribute('aria-label', 'Google Sheet lead form debug');
    panel.innerHTML = [
      '<div class="ea-lead-debug-card">',
      '<p class="ea-lead-debug-eyebrow">Upgrade 06 · Lead verification</p>',
      '<h2>Google Sheet test mode</h2>',
      '<p>This panel is visible only with <code>?lead_debug=1</code>. It sends one safe TEST LEAD row to the configured Google Apps Script endpoint.</p>',
      '<dl>',
      '<div><dt>Endpoint</dt><dd>' + (isConfigured() ? 'Configured /exec URL' : 'Missing or invalid endpoint') + '</dd></div>',
      '<div><dt>Status</dt><dd class="ea-lead-debug-status">Ready for test</dd></div>',
      '</dl>',
      '<button type="button" class="ea-lead-debug-button">Send TEST LEAD to Google Sheet</button>',
      '<p class="ea-lead-debug-note">After clicking, open the Google Sheet and search for “TEST LEAD - Elboubakry Website”. Delete the test row after confirmation.</p>',
      '</div>'
    ].join('');

    document.body.appendChild(panel);

    var status = panel.querySelector('.ea-lead-debug-status');
    var button = panel.querySelector('.ea-lead-debug-button');

    button.addEventListener('click', async function () {
      button.disabled = true;
      status.textContent = 'Sending test lead...';
      panel.classList.remove('is-error', 'is-success');
      try {
        var result = await sendTestLead();
        console.info('[Upgrade 06] TEST LEAD request sent. Check Google Sheet for this payload:', result.payload);
        window.dispatchEvent(new CustomEvent('ea:lead-test-sent', { detail: { method: result.method || 'unknown', endpoint_type: 'google_apps_script' } }));
        panel.classList.add('is-success');
        status.textContent = 'Request sent. Check the Google Sheet now.';
      } catch (error) {
        console.error('[Upgrade 06] TEST LEAD failed:', error);
        window.dispatchEvent(new CustomEvent('ea:lead-test-error', { detail: { error_name: error && error.name ? error.name : 'error' } }));
        panel.classList.add('is-error');
        status.textContent = error && error.message ? error.message : 'Test failed.';
      } finally {
        button.disabled = false;
      }
    });
  }

  function markHealth() {
    document.documentElement.dataset.leadEndpoint = isConfigured() ? 'configured' : 'missing';
    document.documentElement.dataset.leadUpgrade = '06';
    window.EA_LEAD_FORM = Object.freeze({
      version: 'upgrade-06-lead-verification',
      endpointConfigured: isConfigured(),
      endpoint: endpoint,
      sendTestLead: sendTestLead,
      buildTestPayload: basePayload
    });

    if (window.console && console.info) {
      console.info('[Upgrade 06] Lead form health:', {
        endpointConfigured: isConfigured(),
        endpointEndsWithExec: endpoint.endsWith('/exec'),
        debugMode: debugEnabled
      });
    }
  }

  markHealth();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDebugPanel, { once: true });
  } else {
    addDebugPanel();
  }
}());
