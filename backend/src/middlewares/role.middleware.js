const { fail } = require('../utils/api-response');

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    const allowed = role === 'superadmin' && roles.includes('admin') ? true : roles.includes(role);
    if (!role || !allowed) {
      return fail(res, 'Forbidden', 403);
    }
    return next();
  };
}

module.exports = { requireRole };
