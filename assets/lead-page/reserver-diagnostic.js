(() => {
  'use strict';

  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbw83pfpcjAKSgY3wLAzU9QJufvHwdK-Aj-ohZUZsyB8PnRBt_qJrNWYb8WwpJftOqeJ/exec';
  const form = document.getElementById('diagnostic-form');
  if (!form) return;

  const submitButton = form.querySelector('.submit-button');
  const statusBox = document.getElementById('form-status');
  const startedAt = Date.now();
  let hasUserInteracted = false;

  const fields = {
    name: document.getElementById('name'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    sector: document.getElementById('sector')
  };

  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  const normalizePhone = (value) => {
    let phone = String(value || '').replace(/[\s.\-()]/g, '');
    if (phone.startsWith('+212')) phone = phone.slice(1);
    else if (phone.startsWith('0')) phone = `212${phone.slice(1)}`;
    return phone;
  };

  const isValidName = (value) => {
    const name = clean(value).toLowerCase().replace(/\s+/g, '');
    return name.length >= 2 && !/^\d+$/.test(name) && !['ff', 'aa', 'aaa', 'test', '123', '.'].includes(name);
  };

  const isValidPhone = (value) => /^212[67]\d{8}$/.test(normalizePhone(value));
  const isValidEmail = (value) => !clean(value) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean(value));

  const setError = (fieldName, message) => {
    const field = fields[fieldName];
    const error = document.getElementById(`${fieldName}-error`);
    if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message || '';
  };

  const getTracking = () => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || '';
    const referrer = document.referrer || '';
    const sourceText = `${utmSource} ${referrer}`.toLowerCase();
    let source = 'Direct';
    if (/(facebook|instagram|meta)/.test(sourceText)) source = 'Facebook Ads';
    else if (sourceText.includes('google')) source = utmSource.toLowerCase().includes('google') ? 'Google Ads' : 'Organic Search';
    else if (sourceText.includes('linkedin')) source = 'LinkedIn';
    else if (referrer) source = 'Referral';

    return {
      source,
      utm_source: utmSource,
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
      fbclid: params.get('fbclid') || '',
      gclid: params.get('gclid') || '',
      referrer,
      landingPageUrl: window.location.href
    };
  };

  const validate = () => {
    const data = {
      name: clean(fields.name.value),
      phone: normalizePhone(fields.phone.value),
      email: clean(fields.email.value),
      sector: clean(fields.sector.value)
    };

    let firstInvalid = null;
    const errors = {
      name: isValidName(data.name) ? '' : 'Veuillez entrer un nom valide.',
      phone: isValidPhone(fields.phone.value) ? '' : 'Veuillez entrer un numéro WhatsApp marocain valide.',
      email: isValidEmail(data.email) ? '' : 'Veuillez entrer une adresse email valide.',
      sector: data.sector ? '' : 'Veuillez sélectionner votre secteur d’activité.'
    };

    Object.entries(errors).forEach(([key, message]) => {
      setError(key, message);
      if (message && !firstInvalid) firstInvalid = fields[key];
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return null;
    }
    return data;
  };

  const submitWithIframe = (payload) => new Promise((resolve, reject) => {
    const frameName = `lead-submit-${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = frameName;
    iframe.title = 'Lead form submission';
    iframe.hidden = true;

    const fallbackForm = document.createElement('form');
    fallbackForm.method = 'POST';
    fallbackForm.action = ENDPOINT;
    fallbackForm.target = frameName;
    fallbackForm.hidden = true;

    Object.entries(payload).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value == null ? '' : String(value);
      fallbackForm.appendChild(input);
    });

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      window.setTimeout(() => {
        fallbackForm.remove();
        iframe.remove();
      }, 1200);
      resolve();
    };

    iframe.addEventListener('load', () => {
      try {
        if (iframe.contentWindow.location.href === 'about:blank') return;
      } catch (error) {
        // Cross-origin access means the iframe navigated away from the initial blank page.
      }
      window.setTimeout(finish, 400);
    });
    document.body.append(iframe, fallbackForm);
    fallbackForm.submit();
    window.setTimeout(() => {
      if (completed) return;
      completed = true;
      fallbackForm.remove();
      iframe.remove();
      reject(new Error('Lead submission fallback timed out.'));
    }, 5000);
  });

  const sendLead = async (payload) => {
    const params = new URLSearchParams(payload);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 6500);
      await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: params,
        signal: controller.signal
      });
      window.clearTimeout(timeout);
    } catch (error) {
      console.warn('Fetch submission failed; using form fallback.', error);
      await submitWithIframe(payload);
    }
  };

  Object.entries(fields).forEach(([key, field]) => {
    field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
      hasUserInteracted = true;
      setError(key, '');
      statusBox.textContent = '';
      statusBox.className = 'form-status';
    });
  });

  ['pointerdown', 'keydown', 'touchstart'].forEach((eventName) => {
    form.addEventListener(eventName, () => {
      hasUserInteracted = true;
    }, { passive: true });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton.disabled) return;
    if (form.elements.website.value || form.elements.company.value) return;

    const data = validate();
    if (!data) {
      statusBox.textContent = 'Corrigez les champs indiqués pour continuer.';
      statusBox.className = 'form-status error';
      return;
    }

    if (!hasUserInteracted && Date.now() - startedAt < 2500) {
      statusBox.textContent = 'Merci de vérifier les informations avant l’envoi.';
      statusBox.className = 'form-status error';
      return;
    }

    const tracking = getTracking();
    const payload = {
      fullName: data.name,
      phone: data.phone,
      email: data.email,
      businessSector: data.sector,
      message: '',
      website: '',
      source: tracking.source,
      status: 'New',
      priority: 'Medium',
      utm_source: tracking.utm_source,
      utm_medium: tracking.utm_medium,
      utm_campaign: tracking.utm_campaign,
      utm_content: tracking.utm_content,
      utm_term: tracking.utm_term,
      fbclid: tracking.fbclid,
      gclid: tracking.gclid,
      referrer: tracking.referrer,
      landingPageUrl: tracking.landingPageUrl,
      adClickId: tracking.gclid || tracking.fbclid
    };

    const originalLabel = submitButton.querySelector('span').textContent;
    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Envoi en cours...';
    statusBox.textContent = '';
    statusBox.className = 'form-status';

    try {
      await sendLead(payload);
      try {
        sessionStorage.setItem('lead_submitted', 'true');
        if (typeof window.trackEvent === 'function') {
          window.trackEvent('consultation_form_submit', {
            form_name: 'diagnostic_form',
            location: 'reserver_diagnostic'
          });
        }
      } catch (trackingError) {
        console.warn('Lead tracking could not be stored.', trackingError);
      }
      window.location.href = '/merci/';
    } catch (error) {
      console.error(error);
      submitButton.disabled = false;
      submitButton.querySelector('span').textContent = originalLabel;
      statusBox.textContent = 'Une erreur est survenue. Veuillez réessayer ou me contacter sur WhatsApp.';
      statusBox.className = 'form-status error';
    }
  });
})();
