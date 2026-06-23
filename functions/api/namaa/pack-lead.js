import { jsonResponse, optionsResponse, readJson, safeText } from './_api-config.js';

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value || '').trim());
}

function getWebhook(env) {
  const candidates = [
    env?.NAMAA_PACK_CRM_WEBHOOK_URL,
    env?.NAMAA_CRM_WEBHOOK_URL,
    env?.GOOGLE_SHEETS_WEBHOOK_URL,
    env?.LEADS_WEBHOOK_URL,
    env?.APPS_SCRIPT_WEBHOOK_URL,
  ].map((item) => String(item || '').trim()).filter(Boolean);
  return candidates[0] || '';
}

function normalizePackLink(value) {
  const link = safeText(value, 7000);
  if (!link) return '';
  if (/^https?:\/\//i.test(link)) return link;
  return '';
}

async function forwardToCrm(webhookUrl, lead) {
  if (!webhookUrl) return { saved: false, crmStatus: 'not_configured' };

  // Keep Google Sheets clean: the CRM only needs Email + Pack Link.
  // Extra fields are lightweight metadata in case the Apps Script wants to build a dashboard.
  const payload = {
    email: lead.email,
    pack_link: lead.packLink,
    packLink: lead.packLink,
    source: 'Namaa AI',
    status: 'New Pack Lead',
    created_at: lead.createdAt,
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json;charset=UTF-8' },
    body: JSON.stringify(payload),
  });

  return {
    saved: response.ok || response.status === 0 || response.status === 302,
    crmStatus: response.status,
  };
}

function packEmailHtml(lead) {
  const packLink = lead.packLink || '#';
  return `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#111827;line-height:1.6">
      <div style="padding:22px;border-radius:22px;background:#071226;color:white;margin-bottom:20px">
        <h1 style="margin:0;font-size:26px">Namaa Pack</h1>
        <p style="margin:8px 0 0;color:#bfdbfe">Created by Elboubakry Abdessamad</p>
      </div>
      <h2 style="font-size:20px;margin:0 0 12px">Pack dyal project dyalk wajed</h2>
      <p>Salam, clicki 3la link bach tchof Namaa Pack dyalk.</p>
      <p style="margin:24px 0"><a href="${packLink}" style="background:#155EEF;color:white;text-decoration:none;padding:14px 20px;border-radius:14px;font-weight:700">Open my Namaa Pack</a></p>
      <p style="color:#64748b;font-size:13px;margin-top:18px">Namaa AI by Elboubakry Abdessamad.</p>
    </div>`;
}

async function sendEmailIfConfigured(env, lead) {
  const apiKey = String(env?.RESEND_API_KEY || '').trim();
  const from = String(env?.NAMAA_EMAIL_FROM || env?.RESEND_FROM_EMAIL || '').trim();
  if (!apiKey || !from || !lead.packLink) return { emailSent: false, emailStatus: 'not_configured' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [lead.email],
      subject: 'Namaa Pack dyal project dyalk',
      html: packEmailHtml(lead),
    }),
  });

  return { emailSent: response.ok, emailStatus: response.status };
}

export async function onRequestOptions() {
  return optionsResponse();
}

export async function onRequestPost({ request, env }) {
  const body = await readJson(request);
  const email = safeText(body.email, 180).toLowerCase();
  const packLink = normalizePackLink(body.packLink || body.pack_link);

  if (!validEmail(email)) {
    return jsonResponse({ ok: false, error: 'Dakhl email s7i7 bach n7fdo lik Namaa Pack.' }, 400);
  }

  if (!packLink) {
    return jsonResponse({ ok: false, error: 'Pack link missing. 3awed generate Strategy pack w jreb.' }, 400);
  }

  const lead = {
    email,
    packLink,
    createdAt: new Date().toISOString(),
  };

  let crmResult = { saved: false, crmStatus: 'not_sent' };
  let emailResult = { emailSent: false, emailStatus: 'not_configured' };

  try {
    crmResult = await forwardToCrm(getWebhook(env), lead);
  } catch (error) {
    crmResult = { saved: false, crmStatus: 'crm_error' };
  }

  try {
    emailResult = await sendEmailIfConfigured(env, lead);
  } catch (error) {
    emailResult = { emailSent: false, emailStatus: 'email_error' };
  }

  return jsonResponse({
    ok: true,
    message: 'Email and pack link received.',
    crmSaved: Boolean(crmResult.saved),
    emailSent: Boolean(emailResult.emailSent),
  });
}

export async function onRequestGet() {
  return jsonResponse({ ok: true, service: 'Namaa Pack Lead endpoint', fields: ['email', 'pack_link'], status: 'ready' });
}
