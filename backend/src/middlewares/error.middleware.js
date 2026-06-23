const { logError } = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  logError(err.message || 'Unknown error', {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}

module.exports = { errorHandler };
