const DEFAULT_ADMIN_PHONE = "212687321925";
const REQUEST_TIMEOUT_MS = 8000;

function cleanValue(value, max = 500) {
  if (value === undefined || value === null) return "-";
  const cleaned = String(value).replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, max) : "-";
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function whatsappConfig(env = {}) {
  const accessToken = cleanValue(env.WHATSAPP_ACCESS_TOKEN, 4096);
  const phoneNumberId = normalizePhone(env.WHATSAPP_PHONE_NUMBER_ID);
  const graphApiVersion = cleanValue(env.WHATSAPP_GRAPH_API_VERSION, 20);
  const templateName = cleanValue(env.WHATSAPP_ADMIN_TEMPLATE, 512);
  const languageCode = cleanValue(env.WHATSAPP_ADMIN_TEMPLATE_LANG || "fr", 20);
  const adminPhone = normalizePhone(env.WHATSAPP_ADMIN_TO || DEFAULT_ADMIN_PHONE);

  const missing = [];
  if (accessToken === "-") missing.push("WHATSAPP_ACCESS_TOKEN");
  if (!phoneNumberId) missing.push("WHATSAPP_PHONE_NUMBER_ID");
  if (!/^v\d+\.\d+$/.test(graphApiVersion)) missing.push("WHATSAPP_GRAPH_API_VERSION");
  if (templateName === "-") missing.push("WHATSAPP_ADMIN_TEMPLATE");
  if (!/^212[5-7]\d{8}$/.test(adminPhone)) missing.push("WHATSAPP_ADMIN_TO");

  if (missing.length) return { configured: false, missing };
  return {
    configured: true,
    accessToken,
    adminPhone,
    graphApiVersion,
    languageCode,
    phoneNumberId,
    templateName,
  };
}

function leadTemplateParameters(lead = {}) {
  return [
    cleanValue(lead.fullName || lead.full_name, 120),
    cleanValue(lead.phone, 40),
    cleanValue(lead.businessSector || lead.business_sector, 160),
    cleanValue(lead.source, 80),
  ].map((text) => ({ type: "text", text }));
}

async function sendLeadWhatsAppNotification(env, lead, fetchImplementation = fetch) {
  const config = whatsappConfig(env);
  if (!config.configured) return { ok: false, skipped: true, reason: "not_configured", missing: config.missing };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const endpoint = `https://graph.facebook.com/${config.graphApiVersion}/${config.phoneNumberId}/messages`;
    const response = await fetchImplementation(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: config.adminPhone,
        type: "template",
        template: {
          name: config.templateName,
          language: { code: config.languageCode },
          components: [{ type: "body", parameters: leadTemplateParameters(lead) }],
        },
      }),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error("WhatsApp notification request failed.");
      error.status = response.status;
      error.code = result?.error?.code || "WHATSAPP_REQUEST_FAILED";
      throw error;
    }
    return { ok: true, messageId: result?.messages?.[0]?.id || null };
  } finally {
    clearTimeout(timeout);
  }
}

function scheduleLeadWhatsAppNotification(context, lead) {
  const task = sendLeadWhatsAppNotification(context.env, lead)
    .then((result) => {
      if (result.skipped) {
        console.warn("WhatsApp lead notification skipped: missing configuration.");
      } else {
        console.info("WhatsApp lead notification accepted.", { leadId: lead?.id || null, messageId: result.messageId });
      }
      return result;
    })
    .catch((error) => {
      console.error("WhatsApp lead notification failed.", {
        leadId: lead?.id || null,
        status: error?.status || null,
        code: error?.code || error?.name || "UNKNOWN_ERROR",
      });
      return { ok: false, error: true };
    });

  if (typeof context.waitUntil === "function") context.waitUntil(task);
  return task;
}

export {
  DEFAULT_ADMIN_PHONE,
  leadTemplateParameters,
  scheduleLeadWhatsAppNotification,
  sendLeadWhatsAppNotification,
  whatsappConfig,
};
