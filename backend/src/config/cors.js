const cors = require('cors');

function buildCors() {
  return cors({
    origin: true,
    credentials: true,
  });
}

module.exports = { buildCors };
