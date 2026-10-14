export function onRequest(context) {
  const id = String(context.params.id || "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return new Response("Not found", { status: 404 });
  return Response.redirect(`${new URL(context.request.url).origin}/crm/#intelligence/lead/${id}`, 302);
}
