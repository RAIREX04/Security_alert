const { success } = require('../utils/api-response');
const authService = require('../services/auth.service');

async function login(req, res) {
  const { username, pin } = req.validated.body;
  const data = await authService.login(username, pin);
  return success(res, data, 'Login berhasil');
}

async function registerUser(req, res) {
  const data = await authService.registerUser(req.validated.body);
  return success(res, data, 'Registrasi user berhasil', 201);
}

async function registerStaff(req, res) {
  const data = await authService.registerStaff(req.validated.body);
  return success(res, data, 'Pengajuan staff berhasil dikirim', 201);
}

async function refresh(req, res) {
  const data = await authService.refresh(req.validated.body.refreshToken);
  return success(res, data, 'Token diperbarui');
}

async function logout(req, res) {
  const refreshToken = req.body.refreshToken || req.validated?.body?.refreshToken;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  return success(res, null, 'Logout berhasil');
}

async function me(req, res) {
  const data = await authService.me(Number(req.user.sub));
  return success(res, data, 'Profil aktif');
}

async function changePin(req, res) {
  const { currentPin, newPin } = req.validated.body;
  await authService.changePin(Number(req.user.sub), currentPin, newPin);
  return success(res, null, 'PIN berhasil diperbarui');
}

module.exports = {
  login,
  registerUser,
  registerStaff,
  refresh,
  logout,
  me,
  changePin,
};
