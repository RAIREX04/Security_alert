const { verifyAccessToken } = require('../config/jwt');
const { fail } = require('../utils/api-response');

function normalizeAuthUser(payload) {
  if (!payload) return null;

  const userId = Number(payload.userId ?? payload.sub);
  const departmentId = payload.departmentId == null ? null : Number(payload.departmentId);

  return {
    ...payload,
    userId: Number.isFinite(userId) ? userId : undefined,
    sub: payload.sub != null ? String(payload.sub) : undefined,
    departmentId: Number.isFinite(departmentId) ? departmentId : null,
  };
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return fail(res, 'Unauthorized', 401);
  }

  try {
    req.user = normalizeAuthUser(verifyAccessToken(token));
    return next();
  } catch {
    return fail(res, 'Token tidak valid atau kedaluwarsa', 401);
  }
}

module.exports = { authenticate, normalizeAuthUser };
