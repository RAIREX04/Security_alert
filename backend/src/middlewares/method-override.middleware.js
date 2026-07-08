const ALLOWED_METHODS = new Set(['PATCH', 'PUT', 'DELETE']);

function methodOverride(req, _res, next) {
  if (req.method !== 'POST') {
    return next();
  }

  const requestedMethod = String(
    req.get('x-http-method-override') ||
      req.query?._method ||
      req.body?._method ||
      '',
  ).toUpperCase();

  if (ALLOWED_METHODS.has(requestedMethod)) {
    req.method = requestedMethod;
  }

  return next();
}

module.exports = { methodOverride };
