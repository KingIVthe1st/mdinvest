/**
 * Cloudflare Workers stub for /api/lead (optional alternative to Vercel).
 * This is a minimal shim returning a 501 by default so you can wire later.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(url.origin, env)
      });
    }
    if (url.pathname !== '/api/lead') {
      return new Response('Not Found', { status: 404 });
    }
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { code: 'method_not_allowed', message: 'Method not allowed' } }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(url.origin, env) }
      });
    }
    return new Response(JSON.stringify({ error: { code: 'not_implemented', message: 'Configure Workers handler or use Vercel function' } }), {
      status: 501,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(url.origin, env) }
    });
  }
};

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const hdrs = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  };
  if (allowed.length === 0 || allowed.includes(origin)) {
    hdrs['Access-Control-Allow-Origin'] = origin;
  }
  return hdrs;
}