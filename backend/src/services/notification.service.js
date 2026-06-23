const { NotificationLog, UserToken, Department, User, Report } = require('../models');
const { normalizeDepartmentName } = require('../utils/department');

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const EXPO_PUSH_BATCH_SIZE = 100;
const ALERT_SOUND = 'alarm_sound_effect.mp3';
const ALERT_CHANNEL_ID = 'staff-alerts-alarm-v2';
const ALERT_REMINDER_INTERVAL_MS = 30_000;
const reminderTimers = new Map();

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function isExpoPushToken(token) {
  return typeof token === 'string' && token.startsWith('ExponentPushToken[');
}

async function sendExpoPushMessages(messages) {
  if (messages.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const batch of chunk(messages, EXPO_PUSH_BATCH_SIZE)) {
    try {
      const response = await fetch(EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        failureCount += batch.length;
        continue;
      }

      const data = await response.json();
      const receipts = Array.isArray(data?.data) ? data.data : [];
      if (receipts.length === 0) {
        successCount += batch.length;
        continue;
      }

      for (const receipt of receipts) {
        if (receipt?.status === 'ok') {
          successCount += 1;
        } else {
          failureCount += 1;
        }
      }
    } catch {
      failureCount += batch.length;
    }
  }

  return { successCount, failureCount };
}

function buildPushMessages(tokens, payload) {
  return tokens
    .map((record) => record?.fcmToken)
    .filter(isExpoPushToken)
    .map((to) => ({
      to,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      sound: payload.sound || ALERT_SOUND,
      channelId: payload.channelId || ALERT_CHANNEL_ID,
      priority: 'high',
      ttl: 0,
    }));
}

function stopAlertReminderLoop(reportId) {
  const key = String(reportId);
  const timer = reminderTimers.get(key);
  if (timer) {
    clearInterval(timer);
    reminderTimers.delete(key);
  }
}

async function sendAlertReminder(payload, department) {
  const reportId = Number(payload.reportId);
  if (!Number.isFinite(reportId)) {
    return;
  }

  const report = await Report.findByPk(reportId);
  if (!report || report.status !== 'open' || report.assignedStaffId != null) {
    stopAlertReminderLoop(reportId);
    return;
  }

  const tokens = await UserToken.findAll({
    include: [
      {
        model: User,
        where: {
          departmentId: department.departmentId,
          approvalStatus: 'approved',
          isActive: true,
        },
        required: true,
      },
    ],
  });

  const messages = buildPushMessages(tokens, {
    title: payload.title || `Alert Baru - ${department.departmentName}`,
    body: payload.body || payload.description || 'Ada alert baru',
    sound: ALERT_SOUND,
    channelId: ALERT_CHANNEL_ID,
    data: {
      reportId: payload.reportId || null,
      targetDepartmentId: department.departmentId,
      notificationType: 'new_alert_reminder',
      incidentLocationText: payload.incidentLocationText || null,
      sourceDepartmentId: payload.sourceDepartmentId || null,
    },
  });

  await sendExpoPushMessages(messages);
}

function startAlertReminderLoop(payload, department) {
  if (!payload.reportId) {
    return;
  }

  const key = String(payload.reportId);
  stopAlertReminderLoop(payload.reportId);

  const timer = setInterval(() => {
    void sendAlertReminder(payload, department).catch(() => {});
  }, ALERT_REMINDER_INTERVAL_MS);

  reminderTimers.set(key, timer);
}

async function registerToken(userId, token, platform = 'android', deviceId = null) {
  const record = await UserToken.upsert({
    userId,
    fcmToken: token,
    platform,
    deviceId,
    lastSeenAt: new Date(),
  });
  return record;
}

async function removeToken(userId, token) {
  await UserToken.destroy({
    where: {
      userId,
      fcmToken: token,
    },
  });
  return true;
}

async function listLogs() {
  return NotificationLog.findAll({ order: [['created_at', 'DESC']] });
}

async function sendAlertNotification(payload) {
  const departmentId = payload.departmentId ? Number(payload.departmentId) : null;
  const departmentName = normalizeDepartmentName(payload.departmentName || payload.department || '');
  const department = departmentId
    ? await Department.findByPk(departmentId)
    : await Department.findOne({
        where: { departmentName },
      });

  if (!department) {
    throw Object.assign(new Error('Departemen tujuan tidak ditemukan'), {
      statusCode: 404,
    });
  }

  const tokens = await UserToken.findAll({
    include: [
      {
        model: User,
        where: {
          departmentId: department.departmentId,
          approvalStatus: 'approved',
          isActive: true,
        },
        required: true,
      },
    ],
  });

  const messages = buildPushMessages(tokens, {
    title: payload.title || `Alert Baru - ${department.departmentName}`,
    body: payload.body || payload.description || 'Ada alert baru',
    sound: payload.sound || ALERT_SOUND,
    channelId: payload.channelId || ALERT_CHANNEL_ID,
    data: {
      reportId: payload.reportId || null,
      targetDepartmentId: department.departmentId,
      notificationType: 'new_alert',
      incidentLocationText: payload.incidentLocationText || null,
      sourceDepartmentId: payload.sourceDepartmentId || null,
    },
  });

  const { successCount, failureCount } = await sendExpoPushMessages(messages);
  const payloadJson = JSON.stringify({
    ...payload,
    targetDepartmentId: department.departmentId,
  });

  await NotificationLog.create({
    reportId: payload.reportId || null,
    targetDepartmentId: department.departmentId,
    notificationType: 'new_alert',
    title: payload.title || `Alert Baru - ${department.departmentName}`,
    body: payload.body || payload.description || 'Ada alert baru',
    successCount,
    failureCount,
    payloadJson,
  });

  startAlertReminderLoop(payload, department);

  if ((process.env.PUSH_PROVIDER || 'expo') === 'console') {
    console.log(
      JSON.stringify({
        type: 'push-console',
        department: department.departmentName,
        tokens: tokens.length,
        payload,
      }),
    );
  }

  return { successCount, failureCount };
}

async function sendAlertTakenNotification(payload) {
  const departmentId = payload.departmentId ? Number(payload.departmentId) : null;
  const departmentName = normalizeDepartmentName(payload.departmentName || payload.department || '');
  const department = departmentId
    ? await Department.findByPk(departmentId)
    : await Department.findOne({
        where: { departmentName },
      });

  if (!department) {
    return { successCount: 0, failureCount: 0 };
  }

  const tokens = await UserToken.findAll({
    include: [
      {
        model: User,
        where: {
          departmentId: department.departmentId,
          approvalStatus: 'approved',
          isActive: true,
        },
        required: true,
      },
    ],
  });

  const messages = buildPushMessages(tokens, {
    title: 'Task sudah diambil',
    body: 'Alarm dihentikan karena task sudah diambil staff.',
    sound: payload.sound || ALERT_SOUND,
    channelId: payload.channelId || ALERT_CHANNEL_ID,
    data: {
      reportId: payload.reportId || null,
      targetDepartmentId: department.departmentId,
      notificationType: 'alert_taken',
    },
  });

  const { successCount, failureCount } = await sendExpoPushMessages(messages);

  await NotificationLog.create({
    reportId: payload.reportId || null,
    targetDepartmentId: department.departmentId,
    notificationType: 'alert_taken',
    title: 'Task sudah diambil',
    body: 'Alarm dihentikan karena task sudah diambil staff.',
    successCount,
    failureCount,
    payloadJson: JSON.stringify(payload),
  });

  if (payload.reportId) {
    stopAlertReminderLoop(payload.reportId);
  }

  return { successCount, failureCount };
}

module.exports = {
  registerToken,
  removeToken,
  listLogs,
  sendAlertNotification,
  sendAlertTakenNotification,
  stopAlertReminderLoop,
};
