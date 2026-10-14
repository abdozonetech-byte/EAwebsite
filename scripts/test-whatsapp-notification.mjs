import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../functions/_lib/whatsapp.js", import.meta.url), "utf8");
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const { DEFAULT_ADMIN_PHONE, leadTemplateParameters, sendLeadWhatsAppNotification, whatsappConfig } = await import(moduleUrl);

assert.equal(DEFAULT_ADMIN_PHONE, "212687321925");
assert.deepEqual(whatsappConfig({}).missing, [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_GRAPH_API_VERSION",
  "WHATSAPP_ADMIN_TEMPLATE",
]);

const env = {
  WHATSAPP_ACCESS_TOKEN: "test-token",
  WHATSAPP_PHONE_NUMBER_ID: "123456789",
  WHATSAPP_GRAPH_API_VERSION: "v99.0",
  WHATSAPP_ADMIN_TEMPLATE: "new_lead_admin_notification",
  WHATSAPP_ADMIN_TEMPLATE_LANG: "fr",
};

assert.equal(whatsappConfig(env).configured, true);
assert.deepEqual(leadTemplateParameters({ fullName: "Test Lead", phone: "212600000000", businessSector: "Services locaux", source: "diagnostic_site" }), [
  { type: "text", text: "Test Lead" },
  { type: "text", text: "212600000000" },
  { type: "text", text: "Services locaux" },
  { type: "text", text: "diagnostic_site" },
]);

let capturedRequest;
const mockFetch = async (url, options) => {
  capturedRequest = { url, options };
  return new Response(JSON.stringify({ messages: [{ id: "wamid.test" }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const result = await sendLeadWhatsAppNotification(env, {
  id: "lead-test",
  full_name: "Test Lead",
  phone: "212600000000",
  business_sector: "Services locaux",
  source: "diagnostic_site",
}, mockFetch);

assert.deepEqual(result, { ok: true, messageId: "wamid.test" });
assert.equal(capturedRequest.url, "https://graph.facebook.com/v99.0/123456789/messages");
assert.equal(capturedRequest.options.headers.Authorization, "Bearer test-token");

const body = JSON.parse(capturedRequest.options.body);
assert.equal(body.to, "212687321925");
assert.equal(body.template.name, "new_lead_admin_notification");
assert.equal(body.template.components[0].parameters.length, 4);

console.log("WhatsApp notification tests passed.");
