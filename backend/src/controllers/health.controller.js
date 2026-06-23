const { success } = require('../utils/api-response');

function health(req, res) {
  return success(res, {
    ok: true,
    service: 'management-emergency-backend',
    time: new Date().toISOString(),
  }, 'Healthy');
}

module.exports = { health };
