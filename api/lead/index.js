/**
 * Vercel Serverless Function: /api/lead
 * Validates lead payload, inserts into Supabase, issues signed token.
 * Env vars required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - TOKEN_SIGNING_SECRET
 * - TOKEN_TTL_DAYS (optional, default 30)
 * - ALLOWED_ORIGINS (comma-separated)
 * - IP_HASH_PEPPER
 * - CAPTCHA_ENABLED (optional: "true"|"false")
 * - CAPTCHA_PROVIDER (optional)
 * - CAPTCHA_SECRET (optional)
 */
import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    if (req.method === 'OPTIONS') {
      return handleCors(req, res, 200);
    }
    if (req.method !== 'POST') {
      return handleCors(req, res, 405, { error: { code: 'method_not_allowed', message: 'Method not allowed' } });
    }

    // CORS
    const origin = req.headers.origin || '';
    if (!isOriginAllowed(origin)) {
      return handleCors(req, res, 403, { error: { code: 'forbidden_origin', message: 'Origin not allowed' } });
    }

    // Size guard
    const rawBody = await readJsonBody(req, 10 * 1024);
    if (!rawBody) {
      return handleCors(req, res, 400, { error: { code: 'validation_error', message: 'Invalid JSON body' } });
    }

    // Honeypot quick check
    if (typeof rawBody.company === 'string' && rawBody.company.trim().length > 0) {
      return handleCors(req, res, 400, { error: { code: 'validation_error', message: 'Invalid submission' } });
    }

    const {
      name = '',
      email = '',
      phone = '',
      consent = false,
      clientId = '',
      utm_source = '',
      utm_medium = '',
      utm_campaign = '',
      utm_term = '',
      utm_content = '',
      source_path = ''
    } = rawBody;

    const ua = req.headers['user-agent'] || '';
    const ip = getIp(req);
    const ip_hash = sha256Hex(`${ip}|${process.env.IP_HASH_PEPPER || ''}`).slice(0, 64);

    // Validate and normalize
    const payload = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: normalizePhone(String(phone)),
      consent: !!consent,
      client_id: isUuidV4(clientId) ? clientId : (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      utm_source: String(utm_source || '').trim().slice(0,128),
      utm_medium: String(utm_medium || '').trim().slice(0,128),
      utm_campaign: String(utm_campaign || '').trim().slice(0,256),
      utm_term: String(utm_term || '').trim().slice(0,128),
      utm_content: String(utm_content || '').trim().slice(0,128),
      source_path: String(source_path || '').trim().slice(0,2048),
      user_agent: String(ua || '').slice(0,512),
      ip_hash
    };

    const vErr = validatePayload(payload);
    if (vErr) {
      return handleCors(req, res, 400, { error: { code: 'validation_error', message: vErr }, retryable: false });
    }

    // Optional CAPTCHA (stub)
    if ((process.env.CAPTCHA_ENABLED || 'false').toLowerCase() === 'true') {
      // TODO: verify payload.captchaToken with provider
    }

    // Insert into Supabase with service role
    await insertLead(payload);

    // Issue token
    const { token, expiresAt } = issueToken({
      cid: payload.client_id,
      origin
    });

    return handleCors(req, res, 200, { token, expiresAt });

  } catch (err) {
    console.error('Lead API error:', err);
    return handleCors(req, res, 500, { error: { code: 'server_error', message: 'Internal server error' }, retryable: true });
  }
}

/* Helpers */

function isOriginAllowed(origin) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length === 0) return true; // if not set, allow all for dev
  return allowed.includes(origin);
}

function handleCors(req, res, status, body) {
  const origin = req.headers.origin || '';
  res.setHeader('Vary', 'Origin');
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status || 204);
  if (body) res.json(body);
  else res.end();
}

function readJsonBody(req, maxBytes) {
  return new Promise((resolve) => {
    let data = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        resolve(null);
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function validatePayload(p) {
  if (!p.consent) return 'Consent is required';
  const name = p.name;
  if (name.length < 2 || name.length > 100) return 'Invalid name';
  const email = p.email;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!re.test(email) || email.length > 254) return 'Invalid email';
  const pn = p.phone.replace(/\D+/g, '');
  if (pn.length < 7 || pn.length > 32) return 'Invalid phone';
  return '';
}

function normalizePhone(v) {
  return (v || '').replace(/\D+/g, '').slice(0, 32);
}

function getIp(req) {
  const h = req.headers['x-forwarded-for'];
  if (typeof h === 'string') return h.split(',')[0].trim();
  if (Array.isArray(h)) return h[0];
  return req.socket?.remoteAddress || '';
}

function sha256Hex(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function isUuidV4(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s));
}

async function insertLead(p) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    // In dev without Supabase configured, simulate success
    return { id: 'dev-simulated' };
  }
  const url = `${SUPABASE_URL}/rest/v1/leads`;
  const body = {
    name: p.name,
    email: p.email,
    phone: p.phone,
    consent: p.consent,
    client_id: p.client_id,
    source_path: p.source_path,
    utm_source: p.utm_source,
    utm_medium: p.utm_medium,
    utm_campaign: p.utm_campaign,
    utm_term: p.utm_term,
    utm_content: p.utm_content,
    user_agent: p.user_agent,
    ip_hash: p.ip_hash
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(body)
  });

  if (resp.status === 409 || resp.ok) {
    // 409 may occur on unique constraint; treat as dedup success
    return { id: 'ok' };
  }
  const text = await resp.text();
  throw new Error(`Supabase insert failed: ${resp.status} ${text}`);
}

function issueToken({ cid, origin }) {
  const ttlDays = parseInt(process.env.TOKEN_TTL_DAYS || '30', 10);
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + (ttlDays * 86400);
  const payload = { cid, iat: nowSec, exp: expSec, domain: tryParseDomain(origin) };
  const token = signHmac(payload, process.env.TOKEN_SIGNING_SECRET || 'dev-secret');
  return { token, expiresAt: new Date(expSec * 1000).toISOString() };
}

function tryParseDomain(origin) {
  try {
    const u = new URL(origin);
    return u.hostname;
  } catch { return ''; }
}

function signHmac(payload, secret) {
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = `${b64(header)}.${b64(payload)}`;
  const sig = crypto.createHmac('sha256', secret).update(enc).digest('base64url');
  return `${enc}.${sig}`;
}