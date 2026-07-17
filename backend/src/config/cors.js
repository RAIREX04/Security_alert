const cors = require('cors');
const { URL } = require('node:url');

function isLocalOrigin(origin) {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname === '::1'
      || /^10\./.test(hostname)
      || /^192\.168\./.test(hostname)
      || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
}

function buildAllowedOrigins() {
  return (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCors() {
  const allowedOrigins = buildAllowedOrigins();

  return cors({
    origin(origin, callback) {
      if (allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS origin is not allowed'));
    },
    credentials: true,
  });
}

module.exports = { buildCors };
