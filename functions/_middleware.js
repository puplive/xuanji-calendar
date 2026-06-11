/**
 * Root redirect middleware: / → /en
 * Also adds CORS headers to all responses.
 */
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Redirect root to /en
  if (url.pathname === '/') {
    return Response.redirect(new URL('/en', request.url), 302);
  }

  return next();
}
