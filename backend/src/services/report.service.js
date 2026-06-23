const { Op } = require('sequelize');
const {
  Report,
  ReportAttachment,
  Department,
  User,
} = require('../models');
const notificationService = require('./notification.service');

function mapAttachment(attachment) {
  if (!attachment) return null;
  return {
    attachmentId: attachment.attachmentId,
    reportId: attachment.reportId,
    attachmentType: attachment.attachmentType,
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
    mimeType: attachment.mimeType,
    fileSize: attachment.fileSize,
  };
}

function mapReport(report) {
  if (!report) return null;
  return {
    reportId: report.reportId,
    departmentId: report.departmentId,
    sourceDepartmentId: report.sourceDepartmentId,
    reporterUserId: report.reporterUserId,
    assignedStaffId: report.assignedStaffId,
    description: report.description,
    incidentLocationText: report.incidentLocationText,
    incidentLatitude: report.incidentLatitude,
    incidentLongitude: report.incidentLongitude,
    status: report.status,
    progressStartedAt: report.progressStartedAt,
    arrivedAt: report.arrivedAt,
    arrivedLocationText: report.arrivedLocationText,
    completedAt: report.completedAt,
    completedLocationText: report.completedLocationText,
    resolutionMinutes: report.resolutionMinutes,
    completionDescription: report.completionDescription,
    ratingScore: report.ratingScore,
    ratingComment: report.ratingComment,
    ratedAt: report.ratedAt,
    requesterRatingScore: report.requesterRatingScore ?? report.ratingScore,
    requesterRatingComment: report.requesterRatingComment ?? report.ratingComment,
    requesterRatedAt: report.requesterRatedAt ?? report.ratedAt,
    staffRatingScore: report.staffRatingScore,
    staffRatingComment: report.staffRatingComment,
    staffRatedAt: report.staffRatedAt,
    requesterReviewPending: Boolean(
      report.completedAt
      && report.reporterUserId
      && !(report.requesterRatedAt || report.ratedAt),
    ),
    staffReviewPending: Boolean(report.completedAt && report.assignedStaffId && !report.staffRatedAt),
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    department: report.department ? report.department.departmentName : undefined,
    sourceDepartment: report.sourceDepartment ? report.sourceDepartment.departmentName : undefined,
    reporter: report.reporter ? {
      userId: report.reporter.userId,
      fullName: report.reporter.fullName,
      email: report.reporter.email,
    } : undefined,
    assignedStaff: report.assignedStaff ? {
      userId: report.assignedStaff.userId,
      fullName: report.assignedStaff.fullName,
      email: report.assignedStaff.email,
    } : undefined,
    attachments: report.attachments
      ? report.attachments.map(mapAttachment)
      : [],
  };
}

async function resolveReportById(id) {
  return Report.findByPk(id, {
    include: [
      { model: Department, as: 'department' },
      { model: Department, as: 'sourceDepartment' },
      { model: User, as: 'reporter' },
      { model: User, as: 'assignedStaff' },
      { model: ReportAttachment, as: 'attachments' },
    ],
  });
}

function canViewReport(user, report) {
  if (!user || !report) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'staff') {
    return report.departmentId === user.departmentId ||
      report.assignedStaffId === user.userId ||
      report.reporterUserId === user.userId ||
      report.sourceDepartmentId === user.departmentId;
  }
  return report.reporterUserId === user.userId;
}

function canManageReport(user, report) {
  if (!user || !report) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'staff') {
    return report.departmentId === user.departmentId || report.assignedStaffId === user.userId;
  }
  return false;
}

function getActorId(user) {
  const actorId = Number(user?.userId ?? user?.sub);
  if (!Number.isFinite(actorId)) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });
  }
  return actorId;
}

async function listReports(currentUser, query = {}) {
  const currentUserId = getActorId(currentUser);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.departmentId) where.departmentId = query.departmentId;
  const andClauses = [];
  if (query.q) {
    andClauses.push({
      [Op.or]: [
        { description: { [Op.like]: `%${query.q}%` } },
        { incidentLocationText: { [Op.like]: `%${query.q}%` } },
      ],
    });
  }

  if (currentUser.role === 'staff') {
    andClauses.push({
      [Op.or]: [
      { departmentId: currentUser.departmentId },
      { assignedStaffId: currentUserId },
      { reporterUserId: currentUserId },
      { sourceDepartmentId: currentUser.departmentId },
      ],
    });
  } else if (currentUser.role !== 'admin') {
    where.reporterUserId = currentUserId;
  }

  if (andClauses.length > 0) {
    where[Op.and] = andClauses;
  }

  const reports = await Report.findAll({
    where,
    include: [
      { model: Department, as: 'department' },
      { model: Department, as: 'sourceDepartment' },
      { model: User, as: 'reporter' },
      { model: User, as: 'assignedStaff' },
      { model: ReportAttachment, as: 'attachments' },
    ],
    order: [['reportId', 'DESC']],
  });

  return reports.map(mapReport);
}

async function getReport(currentUser, id) {
  const report = await resolveReportById(id);
  if (!report) {
    throw Object.assign(new Error('Report tidak ditemukan'), { statusCode: 404 });
  }
  if (!canViewReport(currentUser, report)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }
  return mapReport(report);
}

async function createReport(currentUser, payload) {
  const currentUserId = getActorId(currentUser);
  const department = await Department.findByPk(payload.departmentId);
  if (!department) {
    throw Object.assign(new Error('Departemen tujuan tidak ditemukan'), {
      statusCode: 404,
    });
  }

  const report = await Report.create({
    departmentId: department.departmentId,
    reporterUserId: currentUserId,
    sourceDepartmentId: payload.sourceDepartmentId || null,
    description: payload.description,
    incidentLocationText: payload.incidentLocationText,
    incidentLatitude: payload.incidentLatitude || null,
    incidentLongitude: payload.incidentLongitude || null,
    status: 'open',
    ratingScore: null,
    ratingComment: null,
    ratedAt: null,
    requesterRatingScore: null,
    requesterRatingComment: null,
    requesterRatedAt: null,
    staffRatingScore: null,
    staffRatingComment: null,
    staffRatedAt: null,
  });

  if (Array.isArray(payload.attachments) && payload.attachments.length > 0) {
    const attachments = payload.attachments.map((attachment) => ({
      ...attachment,
      reportId: report.reportId,
    }));
    await ReportAttachment.bulkCreate(attachments);
  }

  void notificationService.sendAlertNotification({
    reportId: report.reportId,
    departmentId: department.departmentId,
    departmentName: department.departmentName,
    title: `Alert Baru - ${department.departmentName}`,
    body: payload.description,
    description: payload.description,
    incidentLocationText: payload.incidentLocationText,
    sourceDepartmentId: payload.sourceDepartmentId || null,
  }).catch(() => {
    // Keep report creation successful even if push delivery fails.
  });

  const createdReport = await resolveReportById(report.reportId);
  if (createdReport) {
    return mapReport(createdReport);
  }

  // Fallback for cases where the post-create reload is unavailable.
  return mapReport({
    ...report.toJSON(),
    department,
    reporter: {
      userId: currentUser.userId ?? currentUserId,
      fullName: currentUser.name || currentUser.fullName || null,
      email: currentUser.email || null,
    },
    attachments: [],
  });
}

async function updateReportStatus(currentUser, id, status) {
  const report = await Report.findByPk(id);
  if (!report) {
    throw Object.assign(new Error('Report tidak ditemukan'), { statusCode: 404 });
  }

  if (!canViewReport(currentUser, report)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  report.status = status;
  await report.save();
  if (status === 'close' || status === 'progress') {
    try {
      notificationService.stopAlertReminderLoop(report.reportId);
    } catch {
      // Keep status updates resilient even if reminder cleanup fails.
    }
  }
  return getReport(currentUser, id);
}

async function startProgress(currentUser, id, _payload = {}) {
  const currentUserId = getActorId(currentUser);
  const report = await Report.findByPk(id);
  if (!report) {
    throw Object.assign(new Error('Report tidak ditemukan'), { statusCode: 404 });
  }

  if (!canManageReport(currentUser, report)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  const now = new Date();
  report.status = 'progress';
  report.assignedStaffId = _payload.assignedStaffId || currentUserId;
  report.progressStartedAt = now;
  report.arrivedAt = null;
  report.resolutionMinutes = null;
  await report.save();
  void notificationService.sendAlertTakenNotification({
    reportId: report.reportId,
    departmentId: report.departmentId,
    departmentName: report.department?.departmentName || null,
  }).catch(() => {
    // Push delivery is best-effort; progress state should still persist.
  });
  return getReport(currentUser, id);
}

async function markArrived(currentUser, id, _payload = {}) {
  const report = await Report.findByPk(id);
  if (!report) {
    throw Object.assign(new Error('Report tidak ditemukan'), { statusCode: 404 });
  }
  if (!canManageReport(currentUser, report)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  report.arrivedAt = new Date();
  report.arrivedLocationText = _payload.responderLocation || null;
  await report.save();
  return getReport(currentUser, id);
}

async function completeReport(currentUser, id, payload) {
  const report = await Report.findByPk(id);
  if (!report) {
    throw Object.assign(new Error('Report tidak ditemukan'), { statusCode: 404 });
  }
  if (!canManageReport(currentUser, report)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  report.status = 'close';
  report.completionDescription = payload.completionDescription;
  report.completedAt = new Date();
  report.completedLocationText = payload.responderLocation || null;
  report.resolutionMinutes = report.progressStartedAt
    ? Math.max(
        1,
        Math.round((report.completedAt.getTime() - report.progressStartedAt.getTime()) / 60000),
      )
    : null;
  await report.save();
  try {
    notificationService.stopAlertReminderLoop(report.reportId);
  } catch {
    // Reminder cleanup is best-effort.
  }

  if (Array.isArray(payload.attachments) && payload.attachments.length > 0) {
    const attachments = payload.attachments.map((attachment) => ({
      ...attachment,
      reportId: report.reportId,
      attachmentType: 'completion_photo',
    }));
    await ReportAttachment.bulkCreate(attachments);
  }

  return getReport(currentUser, id);
}

async function rateReport(currentUser, id, payload) {
  const currentUserId = getActorId(currentUser);
  const report = await Report.findByPk(id);
  if (!report) {
    throw Object.assign(new Error('Report tidak ditemukan'), { statusCode: 404 });
  }
  const canReviewAsRequester = report.reporterUserId === currentUserId;
  const canReviewAsStaff = report.assignedStaffId === currentUserId;
  const reviewerType = payload.reviewerType
    || (canReviewAsRequester ? 'requester' : canReviewAsStaff ? 'staff' : null);

  if (!reviewerType) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  if (reviewerType === 'requester' && !canReviewAsRequester) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }
  if (reviewerType === 'staff' && !canReviewAsStaff) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  const now = new Date();
  if (reviewerType === 'requester') {
    report.requesterRatingScore = payload.ratingScore;
    report.requesterRatingComment = payload.ratingComment || null;
    report.requesterRatedAt = now;
    report.ratingScore = payload.ratingScore;
    report.ratingComment = payload.ratingComment || null;
    report.ratedAt = now;
  } else {
    report.staffRatingScore = payload.ratingScore;
    report.staffRatingComment = payload.ratingComment || null;
    report.staffRatedAt = now;
  }
  await report.save();
  return getReport(currentUser, id);
}

async function deleteReport(id) {
  try {
    notificationService.stopAlertReminderLoop(id);
  } catch {
    // Ignore reminder cleanup errors for deletes.
  }
  await ReportAttachment.destroy({ where: { reportId: id } });
  await Report.destroy({ where: { reportId: id } });
  return true;
}

async function reportsByDepartment(currentUser, departmentId) {
  getActorId(currentUser);
  if (currentUser.role === 'staff' && Number(currentUser.departmentId) !== Number(departmentId)) {
    return [];
  }
  return listReports(currentUser, { departmentId });
}

async function reportsByUser(currentUser, userId) {
  const currentUserId = getActorId(currentUser);
  if (currentUser.role !== 'admin' && currentUserId !== Number(userId)) {
    return [];
  }
  const reports = await Report.findAll({
    where: { reporterUserId: userId },
    include: [
      { model: Department, as: 'department' },
      { model: Department, as: 'sourceDepartment' },
      { model: User, as: 'reporter' },
      { model: User, as: 'assignedStaff' },
      { model: ReportAttachment, as: 'attachments' },
    ],
    order: [['reportId', 'DESC']],
  });
  return reports.map(mapReport);
}

async function reportsByStaff(currentUser, staffId) {
  const currentUserId = getActorId(currentUser);
  if (currentUser.role !== 'admin' && currentUserId !== Number(staffId)) {
    return [];
  }
  const reports = await Report.findAll({
    where: { assignedStaffId: staffId },
    include: [
      { model: Department, as: 'department' },
      { model: Department, as: 'sourceDepartment' },
      { model: User, as: 'reporter' },
      { model: User, as: 'assignedStaff' },
      { model: ReportAttachment, as: 'attachments' },
    ],
    order: [['reportId', 'DESC']],
  });
  if (currentUser.role === 'staff' && currentUserId !== Number(staffId) && currentUser.role !== 'admin') {
    return [];
  }
  return reports.map(mapReport);
}

module.exports = {
  mapReport,
  listReports,
  getReport,
  createReport,
  updateReportStatus,
  startProgress,
  markArrived,
  completeReport,
  rateReport,
  deleteReport,
  reportsByDepartment,
  reportsByUser,
  reportsByStaff,
};
