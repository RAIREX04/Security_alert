const { fail } = require('../utils/api-response');

function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return fail(res, 'Forbidden', 403);
    }
    return next();
  };
}

module.exports = { requireRole };
