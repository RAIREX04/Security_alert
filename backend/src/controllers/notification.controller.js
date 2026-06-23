const { success } = require('../utils/api-response');
const notificationService = require('../services/notification.service');

async function registerToken(req, res) {
  const data = await notificationService.registerToken(
    Number(req.user.sub),
    req.validated.body.fcmToken,
    req.validated.body.platform || 'android',
    req.validated.body.deviceId || null,
  );
  return success(res, data, 'Token notifikasi tersimpan');
}

async function removeToken(req, res) {
  await notificationService.removeToken(Number(req.user.sub), req.validated.body.fcmToken);
  return success(res, null, 'Token notifikasi dihapus');
}

async function sendAlert(req, res) {
  const data = await notificationService.sendAlertNotification(req.validated.body);
  return success(res, data, 'Notifikasi alert dikirim');
}

async function alertTaken(req, res) {
  const data = await notificationService.sendAlertTakenNotification(req.validated.body);
  return success(res, data, 'Notifikasi alert taken dikirim');
}

async function logs(req, res) {
  const data = await notificationService.listLogs();
  return success(res, data, 'Log notifikasi');
}

module.exports = {
  registerToken,
  removeToken,
  sendAlert,
  alertTaken,
  logs,
};
