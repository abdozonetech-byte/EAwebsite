const COOKIE_NAME = "elboubakry_crm_session";

function response() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": `${COOKIE_NAME}=; Path=/crm; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
    },
  });
}

export function onRequest(context) {
  if (context.request.method === "POST") return response();
  return new Response(JSON.stringify({ ok: false, message: "Method not allowed." }), {
    status: 405,
    headers: { "Content-Type": "application/json; charset=utf-8", Allow: "POST", "Cache-Control": "no-store" },
  });
}
