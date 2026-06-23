const morgan = require('morgan');

function requestLogger() {
  return morgan(':method :url :status :response-time ms');
}

module.exports = { requestLogger };
