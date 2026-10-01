(() => {
  'use strict';

  const ENDPOINT = '/api/leads';
  const form = document.getElementById('diagnostic-form');
  if (!form) return;

  document.documentElement.classList.add('js-reveal');
  const progress = document.querySelector('.page-progress');
  const mobileCta = document.querySelector('.mobile-form-cta');
  const revealItems = document.querySelectorAll('[data-reveal]');

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));

    if (mobileCta) {
      const formObserver = new IntersectionObserver(([entry]) => {
        mobileCta.classList.toggle('is-hidden', entry.isIntersecting);
      }, { threshold: 0.08 });
      formObserver.observe(form);
    }
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

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

  const sendLead = async (payload) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) throw new Error(result.message || 'Lead submission failed.');
      return result;
    } finally {
      window.clearTimeout(timeout);
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
    if (form.elements.contact_url_check.value) {
      console.warn('Honeypot triggered; submission ignored.');
      return;
    }

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
      contactUrlCheck: form.elements.contact_url_check.value,
      acquisitionSource: tracking.source,
      utmSource: tracking.utm_source,
      utmMedium: tracking.utm_medium,
      utmCampaign: tracking.utm_campaign,
      utmContent: tracking.utm_content,
      utmTerm: tracking.utm_term,
      fbclid: tracking.fbclid,
      gclid: tracking.gclid,
      referrer: tracking.referrer,
      landingPageUrl: tracking.landingPageUrl
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
