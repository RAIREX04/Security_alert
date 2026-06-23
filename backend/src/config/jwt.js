const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function accessSecret() {
  return process.env.JWT_ACCESS_SECRET || 'access-secret';
}

function refreshSecret() {
  return process.env.JWT_REFRESH_SECRET || 'refresh-secret';
}

function accessExpiresIn() {
  return process.env.JWT_ACCESS_EXPIRES_IN || '15m';
}

function refreshExpiresIn() {
  return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
}

function signAccessToken(payload) {
  return jwt.sign(payload, accessSecret(), {
    expiresIn: accessExpiresIn(),
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, refreshSecret(), {
    expiresIn: refreshExpiresIn(),
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret());
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret());
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
