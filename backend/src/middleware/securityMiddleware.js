// Middleware de Seguridad, Sanitización XSS, Autenticación HMAC y Rate Limiting (DT-1 - AB#27)
const crypto = require('node:crypto');

const AUTH_SECRET = process.env.JWT_SECRET || process.env.API_AUTH_TOKEN || 'ih-enclave-hmac-secret-2026-umg';

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Escapa caracteres especiales HTML para prevenir XSS almacenado y reflejado (OWASP A03)
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}

/**
 * Sanitiza cadenas de entrada removiendo etiquetas <script>, eventos on* y ángulos HTML
 */
function sanitizeInputString(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Sanitiza recursivamente todos los campos string de un payload
 */
function sanitizePayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);
  const cleaned = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string') {
      cleaned[key] = sanitizeInputString(val);
    } else if (val && typeof val === 'object') {
      cleaned[key] = sanitizePayload(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

/**
 * Cabeceras HTTP de seguridad (equivalente ligero a Helmet sin dependencias externas)
 */
function securityHeadersMiddleware(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'");
  next();
}

/**
 * Elimina campos sensibles (accessCode, password) antes de exponer un usuario por HTTP
 */
function toPublicUser(user) {
  if (!user || typeof user !== 'object') return null;
  const { accessCode, accessCodeHash, password, ...safeUser } = user;
  return safeUser;
}

/**
 * Genera un token firmado con HMAC-SHA256 sin dependencias externas
 */
function generateAuthToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 8 * 60 * 60 * 1000 // 8 horas
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifica un token HMAC-SHA256 y devuelve su payload o null si es inválido/expirado
 */
function verifyAuthToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extrae el contexto del operador autenticado desde Authorization Bearer o cabeceras de sesión
 */
function attachOperatorContext(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const verified = verifyAuthToken(authHeader.slice(7).trim());
    if (verified) {
      req.user = verified;
      return next();
    }
  }
  const headerRole = req.headers['x-operator-role'];
  const headerName = req.headers['x-operator-name'];
  const headerId = req.headers['x-operator-id'];
  if (headerRole) {
    req.user = {
      sub: headerId ? Number(headerId) : null,
      name: headerName ? sanitizeInputString(String(headerName)) : 'Operador',
      role: String(headerRole).toUpperCase()
    };
  }
  next();
}

/**
 * Middleware de autorización RBAC: bloquea operadores sin rol ADMIN (OWASP A01)
 */
function requireAdminRole(req, res, next) {
  if (req.user && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Acceso denegado (403 Forbidden): Esta operación requiere privilegios de rol ADMIN',
      status: 403
    });
  }
  next();
}

/**
 * Rate Limiter en memoria por IP (protección contra fuerza bruta y DoS - DT-4)
 */
function createRateLimiter({ windowMs = 60_000, max = 120 } = {}) {
  const hits = new Map();
  return function rateLimiterMiddleware(req, res, next) {
    if (process.env.NODE_ENV === 'test') return next();
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || 'local';
    const entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(max - 1));
      return next();
    }
    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    if (entry.count > max) {
      return res.status(429).json({
        error: 'Demasiadas peticiones desde esta IP. Intente nuevamente más tarde.',
        status: 429
      });
    }
    next();
  };
}

module.exports = {
  escapeHtml,
  securityHeadersMiddleware,
  sanitizeInputString,
  sanitizePayload,
  toPublicUser,
  generateAuthToken,
  verifyAuthToken,
  attachOperatorContext,
  requireAdminRole,
  createRateLimiter
};
