import { COOKIE_NAME } from "../../_lib/auth.js";
import { json } from "../../_lib/http.js";

function response() {
  const headers = new Headers({ "Set-Cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
  headers.append("Set-Cookie", `${COOKIE_NAME}=; Path=/crm; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
  return json({ ok: true }, 200, headers);
}

export function onRequest(context) {
  if (context.request.method === "POST") return response();
  return json({ ok: false, message: "Method not allowed." }, 405, { Allow: "POST" });
}
