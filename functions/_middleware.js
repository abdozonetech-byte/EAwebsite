import { hasValidCrmSession } from "./_lib/auth.js";

function withCrmHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()");
  headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; upgrade-insecure-requests");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function isHtmlNavigation(request, pathname) {
  const accept = request.headers.get("Accept") || "";
  return accept.includes("text/html") || pathname.endsWith("/") || !pathname.split("/").pop()?.includes(".");
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith("/crm/") && !pathname.startsWith("/api/crm/")) return context.next();

  if (pathname === "/api/crm/login" || pathname === "/api/crm/logout") {
    return withCrmHeaders(await context.next());
  }

  if (pathname.startsWith("/api/crm/")) {
    const response = await context.next();
    return withCrmHeaders(response);
  }

  const loginRoute = pathname === "/crm/login/" || pathname === "/crm/login/index.html";
  const sessionValid = await hasValidCrmSession(request, env);

  if (loginRoute) {
    if (sessionValid) return Response.redirect(new URL("/crm/", url), 302);
    return withCrmHeaders(await context.next());
  }

  if (!sessionValid) {
    if (isHtmlNavigation(request, pathname)) {
      const loginUrl = new URL("/crm/login/", url);
      if (pathname !== "/crm/") loginUrl.searchParams.set("next", pathname);
      return new Response(null, { status: 302, headers: { Location: loginUrl.toString(), "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet" } });
    }
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      },
    });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  return withCrmHeaders(await context.next());
}
