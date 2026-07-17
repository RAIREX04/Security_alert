const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const PORT = Number(process.env.MOCK_API_PORT || 3001);
const HOST = process.env.MOCK_API_HOST || '127.0.0.1';
const PUBLIC_URL = process.env.MOCK_API_PUBLIC_URL || `http://${HOST}:${PORT}`;
const BASE_URL = PUBLIC_URL.replace(/\/+$/, '');
const UPLOAD_DIR = path.resolve(__dirname, 'mock-uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const departments = [
  {
    departmentId: 1,
    departmentCode: 'ALERT SECURITY',
    departmentName: 'ALERT SECURITY',
    description: 'Penanganan keamanan dan gangguan kantor dan perumahan',
    icon: 'shield',
    color: '#1D4ED8',
    isActive: true,
  },
  {
    departmentId: 2,
    departmentCode: 'ALERT FIRE STATION',
    departmentName: 'ALERT FIRE STATION',
    description: 'Penanganan kebakaran, ledakan, dan gas berbahaya',
    icon: 'fire',
    color: '#DC2626',
    isActive: true,
  },
  {
    departmentId: 3,
    departmentCode: 'ALERT MEDICAL',
    departmentName: 'ALERT MEDICAL',
    description: 'Penanganan kondisi kesehatan darurat',
    icon: 'medical',
    color: '#059669',
    isActive: true,
  },
  {
    departmentId: 4,
    departmentCode: 'IT HELPDESK',
    departmentName: 'IT HELPDESK',
    description: 'Penanganan gangguan IT, infrastruktur jaringan, dan aplikasi',
    icon: 'computer',
    color: '#EA580C',
    isActive: true,
  },
];

const users = [
  {
    userId: 1,
    roleId: 1,
    departmentId: null,
    fullName: 'Super Admin',
    username: 'admin',
    email: 'admin@emergency.local',
    phoneNumber: null,
    photoUrl: null,
    approvalStatus: 'approved',
    approvedByUserId: null,
    approvedAt: new Date().toISOString(),
    isActive: true,
    lastLoginAt: null,
    role: 'superadmin',
  },
  {
    userId: 5,
    roleId: 5,
    departmentId: null,
    fullName: 'QA View Only',
    username: 'qa.view',
    email: 'qa.view@emergency.local',
    phoneNumber: '081234567804',
    photoUrl: null,
    approvalStatus: 'approved',
    approvedByUserId: 1,
    approvedAt: new Date().toISOString(),
    isActive: true,
    lastLoginAt: null,
    role: 'view_only',
  },
  {
    userId: 2,
    roleId: 2,
    departmentId: 1,
    fullName: 'QA Staff Security',
    username: 'qa.staff',
    email: 'qa.staff@emergency.local',
    phoneNumber: '081234567801',
    photoUrl: null,
    approvalStatus: 'approved',
    approvedByUserId: 1,
    approvedAt: new Date().toISOString(),
    isActive: true,
    lastLoginAt: null,
    role: 'staff',
  },
  {
    userId: 3,
    roleId: 3,
    departmentId: null,
    fullName: 'QA User Reporter',
    username: 'qa.user',
    email: 'qa.user@emergency.local',
    phoneNumber: '081234567802',
    photoUrl: null,
    approvalStatus: 'approved',
    approvedByUserId: 1,
    approvedAt: new Date().toISOString(),
    isActive: true,
    lastLoginAt: null,
    role: 'user',
  },
  {
    userId: 4,
    roleId: 2,
    departmentId: 1,
    fullName: 'QA Pending Staff',
    username: 'qa.pending.staff',
    email: 'qa.pending.staff@emergency.local',
    phoneNumber: '081234567803',
    photoUrl: null,
    approvalStatus: 'pending',
    approvedByUserId: null,
    approvedAt: null,
    isActive: true,
    lastLoginAt: null,
    role: 'staff',
  },
];

const reports = [
  {
    reportId: 1,
    departmentId: 1,
    sourceDepartmentId: null,
    reporterUserId: 3,
    assignedStaffId: 2,
    description: 'QA alert contoh untuk alur staff',
    incidentLocationText: 'Lobby Gedung A',
    incidentLatitude: -6.2001,
    incidentLongitude: 106.8166,
    status: 'progress',
    progressStartedAt: new Date().toISOString(),
    arrivedAt: null,
    completedAt: null,
    resolutionMinutes: null,
    completionDescription: null,
    ratingScore: null,
    ratingComment: null,
    ratedAt: null,
    requesterRatingScore: null,
    requesterRatingComment: null,
    requesterRatedAt: null,
    staffRatingScore: null,
    staffRatingComment: null,
    staffRatedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: [],
  },
];

let nextUserId = 6;
let nextReportId = 2;
let nextAttachmentId = 1;

const tokenByValue = new Map();
const tokenByRefresh = new Map();

function now() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function findDepartment(departmentId) {
  return departments.find((item) => item.departmentId === Number(departmentId));
}

function findUser(userId) {
  return users.find((item) => item.userId === Number(userId));
}

function sanitizeUser(user) {
  if (!user) return null;
  const department = findDepartment(user.departmentId);
  return {
    userId: user.userId,
    roleId: user.roleId,
    departmentId: user.departmentId,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    photoUrl: user.photoUrl,
    approvalStatus: user.approvalStatus,
    approvedByUserId: user.approvedByUserId,
    approvedAt: user.approvedAt,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    role: user.role,
    department: department?.departmentName ?? null,
  };
}

function mapAttachment(attachment) {
  return {
    attachmentId: attachment.attachmentId,
    reportId: attachment.reportId,
    attachmentType: attachment.attachmentType,
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
    mimeType: attachment.mimeType ?? null,
    fileSize: attachment.fileSize ?? null,
  };
}

function mapReport(report) {
  const department = findDepartment(report.departmentId);
  const sourceDepartment = report.sourceDepartmentId ? findDepartment(report.sourceDepartmentId) : null;
  const reporter = findUser(report.reporterUserId);
  const assignedStaff = report.assignedStaffId ? findUser(report.assignedStaffId) : null;
  return {
    ...clone(report),
    department: department?.departmentName ?? null,
    sourceDepartment: sourceDepartment?.departmentName ?? null,
    reporter: reporter
      ? {
          userId: reporter.userId,
          fullName: reporter.fullName,
          email: reporter.email,
        }
      : null,
    assignedStaff: assignedStaff
      ? {
          userId: assignedStaff.userId,
          fullName: assignedStaff.fullName,
          email: assignedStaff.email,
        }
      : null,
    attachments: (report.attachments ?? []).map(mapAttachment),
  };
}

function makeAccessToken(user) {
  const token = `mock-access-${user.userId}-${Date.now()}`;
  tokenByValue.set(token, user.userId);
  return token;
}

function makeRefreshToken(user) {
  const token = `mock-refresh-${user.userId}-${Date.now()}`;
  tokenByRefresh.set(token, user.userId);
  return token;
}

function getAuthUser(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1];
  const userId = tokenByValue.get(token);
  if (!userId) return null;
  return findUser(userId) ?? null;
}

function authRequired(req, res, next) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  req.user = user;
  next();
}

function roleRequired(...roles) {
  return (req, res, next) => {
    const allowed = req.user?.role === 'superadmin' && roles.includes('admin') ? true : roles.includes(req.user?.role);
    if (!req.user || !allowed) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
}

function success(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function filterUsers(query = {}) {
  return users.filter((user) => {
    if (query.role) {
      const role = String(query.role).toLowerCase();
      if (user.role !== role) return false;
    }
    if (query.departmentId && Number(user.departmentId) !== Number(query.departmentId)) return false;
    if (query.approvalStatus && user.approvalStatus !== query.approvalStatus) return false;
    if (query.q) {
      const q = String(query.q).toLowerCase();
      const haystack = `${user.fullName} ${user.username} ${user.email}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

function visibleReports(currentUser, query = {}) {
  return reports.filter((report) => {
    if (query.status && report.status !== query.status) return false;
    if (query.departmentId && Number(report.departmentId) !== Number(query.departmentId)) return false;
    if (query.q) {
      const q = String(query.q).toLowerCase();
      const haystack = `${report.description} ${report.incidentLocationText}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.role === 'view_only') return true;
    if (currentUser.role === 'staff') {
      return (
        report.departmentId === currentUser.departmentId ||
        report.assignedStaffId === currentUser.userId ||
        report.reporterUserId === currentUser.userId ||
        report.sourceDepartmentId === currentUser.departmentId
      );
    }
    return report.reporterUserId === currentUser.userId;
  });
}

function createAttachment(reportId, attachment, defaultType) {
  const next = {
    attachmentId: nextAttachmentId++,
    reportId,
    attachmentType: attachment.attachmentType || defaultType,
    fileName: attachment.fileName,
    fileUrl: attachment.fileUrl,
    mimeType: attachment.mimeType ?? null,
    fileSize: attachment.fileSize ?? null,
  };
  return next;
}

function applyReportAttachmentList(report, attachments, defaultType) {
  if (!Array.isArray(attachments) || attachments.length === 0) return;
  report.attachments = report.attachments || [];
  for (const attachment of attachments) {
    report.attachments.push(createAttachment(report.reportId, attachment, defaultType));
  }
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({ storage: uploadStorage, limits: { fileSize: 10 * 1024 * 1024 } });

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (_req, res) => success(res, { ok: true, mode: 'mock' }, 'OK'));

app.post('/api/auth/login', (req, res) => {
  const { username, pin } = req.body || {};
  const normalized = String(username || '').trim().toLowerCase();
  const user = users.find((item) => item.username.toLowerCase() === normalized || item.email.toLowerCase() === normalized);

  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Akun tidak ditemukan' });
  }
  if (String(pin || '') !== '123456') {
    return res.status(401).json({ success: false, message: 'Username atau PIN salah' });
  }
  if (user.role === 'staff' && user.approvalStatus !== 'approved') {
    return res.status(403).json({ success: false, message: 'Akun staff belum disetujui admin' });
  }

  user.lastLoginAt = now();
  const accessToken = makeAccessToken(user);
  const refreshToken = makeRefreshToken(user);
  return success(res, {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  }, 'Login berhasil');
});

app.post('/api/auth/register-user', (req, res) => {
  const body = req.body || {};
  const user = {
    userId: nextUserId++,
    roleId: 3,
    departmentId: null,
    fullName: body.fullName,
    username: String(body.username || '').toLowerCase(),
    email: (body.email || `${String(body.username || '').toLowerCase()}@emergency.local`).toLowerCase(),
    phoneNumber: body.phoneNumber || null,
    photoUrl: body.photoUrl || null,
    approvalStatus: 'approved',
    approvedByUserId: 1,
    approvedAt: now(),
    isActive: true,
    lastLoginAt: null,
    role: 'user',
  };
  users.push(user);
  return success(res, sanitizeUser(user), 'Registrasi user berhasil', 201);
});

app.post('/api/auth/register-staff', (req, res) => {
  const body = req.body || {};
  const user = {
    userId: nextUserId++,
    roleId: 2,
    departmentId: Number(body.departmentId || 1),
    fullName: body.fullName,
    username: String(body.username || '').toLowerCase(),
    email: (body.email || `${String(body.username || '').toLowerCase()}@emergency.local`).toLowerCase(),
    phoneNumber: body.phoneNumber || null,
    photoUrl: body.photoUrl || null,
    approvalStatus: 'pending',
    approvedByUserId: null,
    approvedAt: null,
    isActive: true,
    lastLoginAt: null,
    role: 'staff',
  };
  users.push(user);
  return success(res, sanitizeUser(user), 'Pengajuan staff berhasil dikirim', 201);
});

app.get('/api/auth/me', authRequired, (req, res) => success(res, sanitizeUser(req.user), 'Profil aktif'));

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  const userId = tokenByRefresh.get(refreshToken);
  const user = userId ? findUser(userId) : null;
  if (!user) return res.status(401).json({ success: false, message: 'Refresh token tidak valid' });
  const accessToken = makeAccessToken(user);
  const nextRefreshToken = makeRefreshToken(user);
  return success(res, { user: sanitizeUser(user), accessToken, refreshToken: nextRefreshToken }, 'Token diperbarui');
});

app.post('/api/auth/logout', authRequired, (req, res) => success(res, null, 'Logout berhasil'));

app.patch('/api/auth/change-pin', authRequired, (req, res) => success(res, null, 'PIN berhasil diperbarui'));

app.get('/api/users/me', authRequired, (req, res) => success(res, sanitizeUser(req.user), 'Profil aktif'));

app.get('/api/users/me/summary', authRequired, (req, res) => {
  const reportsHandled = reports.filter((report) => report.assignedStaffId === req.user.userId).length;
  const reportsCreated = reports.filter((report) => report.reporterUserId === req.user.userId).length;
  return success(res, { reportsHandled, reportsCreated }, 'Ringkasan profil aktif');
});

app.put('/api/users/me', authRequired, (req, res) => {
  Object.assign(req.user, {
    fullName: req.body.fullName ?? req.user.fullName,
    username: req.body.username ? String(req.body.username).toLowerCase() : req.user.username,
    email: req.body.email ? String(req.body.email).toLowerCase() : req.user.email,
    phoneNumber: req.body.phoneNumber ?? req.user.phoneNumber,
    photoUrl: req.body.photoUrl ?? req.user.photoUrl,
  });
  return success(res, sanitizeUser(req.user), 'Profil berhasil diperbarui');
});

app.get('/api/users/options', authRequired, roleRequired('admin'), (_req, res) => {
  return success(res, {
    roles: [
      { roleId: 1, roleName: 'superadmin' },
      { roleId: 4, roleName: 'admin' },
      { roleId: 2, roleName: 'staff' },
      { roleId: 3, roleName: 'user' },
      { roleId: 5, roleName: 'view_only' },
    ],
    departments: departments.map((department) => ({
      departmentId: department.departmentId,
      departmentName: department.departmentName,
    })),
  }, 'Opsi form user');
});

app.get('/api/users/pending-staff', authRequired, roleRequired('admin'), (_req, res) => {
  return success(res, filterUsers({ role: 'staff', approvalStatus: 'pending' }).map(sanitizeUser), 'Daftar staff pending');
});

app.get('/api/users', authRequired, roleRequired('admin'), (req, res) => {
  return success(res, filterUsers(req.query).map(sanitizeUser), 'Daftar user');
});

app.get('/api/users/:id', authRequired, roleRequired('admin'), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  return success(res, sanitizeUser(user), 'Detail user');
});

app.post('/api/users', authRequired, roleRequired('admin'), (req, res) => {
  const body = req.body || {};
  const roleName = body.roleName || 'user';
  const roleId = roleName === 'superadmin' ? 1 : roleName === 'admin' ? 4 : roleName === 'staff' ? 2 : roleName === 'view_only' ? 5 : 3;
  const user = {
    userId: nextUserId++,
    roleId,
    departmentId: body.departmentId ?? null,
    fullName: body.fullName,
    username: String(body.username || '').toLowerCase(),
    email: (body.email || `${String(body.username || '').toLowerCase()}@emergency.local`).toLowerCase(),
    phoneNumber: body.phoneNumber || null,
    photoUrl: body.photoUrl || null,
    approvalStatus: body.approvalStatus || 'approved',
    approvedByUserId: body.approvalStatus === 'pending' ? null : req.user.userId,
    approvedAt: body.approvalStatus === 'pending' ? null : now(),
    isActive: true,
    lastLoginAt: null,
    role: roleName,
  };
  users.push(user);
  return success(res, sanitizeUser(user), 'User berhasil dibuat', 201);
});

app.put('/api/users/:id', authRequired, roleRequired('admin'), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  Object.assign(user, {
    fullName: req.body.fullName ?? user.fullName,
    username: req.body.username ? String(req.body.username).toLowerCase() : user.username,
    email: req.body.email ? String(req.body.email).toLowerCase() : user.email,
    phoneNumber: req.body.phoneNumber ?? user.phoneNumber,
    departmentId: req.body.departmentId ?? user.departmentId,
    photoUrl: req.body.photoUrl ?? user.photoUrl,
    approvalStatus: req.body.approvalStatus ?? user.approvalStatus,
    isActive: typeof req.body.isActive === 'boolean' ? req.body.isActive : user.isActive,
  });
  return success(res, sanitizeUser(user), 'User berhasil diperbarui');
});

app.delete('/api/users/:id', authRequired, roleRequired('admin'), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  user.isActive = false;
  return success(res, true, 'User berhasil dihapus');
});

app.patch('/api/users/:id/approve', authRequired, roleRequired('admin'), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  user.approvalStatus = 'approved';
  user.approvedByUserId = req.user.userId;
  user.approvedAt = now();
  return success(res, sanitizeUser(user), 'Staff disetujui');
});

app.patch('/api/users/:id/reject', authRequired, roleRequired('admin'), (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  user.approvalStatus = 'rejected';
  user.approvedByUserId = req.user.userId;
  user.approvedAt = now();
  return success(res, sanitizeUser(user), 'Staff ditolak');
});

app.get('/api/departments', authRequired, (_req, res) => {
  return success(res, departments, 'Daftar departemen');
});

app.get('/api/departments/:id', authRequired, (req, res) => {
  const department = findDepartment(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: 'Departemen tidak ditemukan' });
  return success(res, department, 'Detail departemen');
});

app.get('/api/departments/:id/stats', authRequired, roleRequired('admin'), (req, res) => {
  const departmentId = Number(req.params.id);
  const deptReports = reports.filter((report) => report.departmentId === departmentId);
  const totalStaff = users.filter((user) => user.role === 'staff' && user.departmentId === departmentId).length;
  return success(res, {
    totalStaff,
    openReports: deptReports.filter((report) => report.status === 'open').length,
    progressReports: deptReports.filter((report) => report.status === 'progress').length,
    closeReports: deptReports.filter((report) => report.status === 'close').length,
  }, 'Statistik departemen');
});

app.get('/api/reports/department/:id', authRequired, roleRequired('admin', 'staff'), (req, res) => {
  const departmentId = Number(req.params.id);
  return success(res, visibleReports(req.user, { departmentId }).map(mapReport), 'Report per departemen');
});

app.get('/api/reports/user/:id', authRequired, roleRequired('admin', 'staff'), (req, res) => {
  const userId = Number(req.params.id);
  return success(res, reports.filter((report) => report.reporterUserId === userId).map(mapReport), 'Report per user');
});

app.get('/api/reports/staff/:id', authRequired, roleRequired('admin'), (req, res) => {
  const staffId = Number(req.params.id);
  return success(res, reports.filter((report) => report.assignedStaffId === staffId).map(mapReport), 'Report per staff');
});

app.get('/api/reports', authRequired, (req, res) => {
  return success(res, visibleReports(req.user, req.query).map(mapReport), 'Daftar report');
});

app.get('/api/reports/:id', authRequired, (req, res) => {
  const report = reports.find((item) => item.reportId === Number(req.params.id));
  if (!report) return res.status(404).json({ success: false, message: 'Report tidak ditemukan' });
  return success(res, mapReport(report), 'Detail report');
});

app.post('/api/reports', authRequired, (req, res) => {
  const body = req.body || {};
  const department = findDepartment(body.departmentId);
  if (!department) return res.status(404).json({ success: false, message: 'Departemen tujuan tidak ditemukan' });
  const report = {
    reportId: nextReportId++,
    departmentId: department.departmentId,
    sourceDepartmentId: body.sourceDepartmentId ?? null,
    reporterUserId: req.user.userId,
    assignedStaffId: null,
    description: body.description,
    incidentLocationText: body.incidentLocationText,
    incidentLatitude: body.incidentLatitude ?? null,
    incidentLongitude: body.incidentLongitude ?? null,
    status: 'open',
    progressStartedAt: null,
    arrivedAt: null,
    completedAt: null,
    resolutionMinutes: null,
    completionDescription: null,
    ratingScore: null,
    ratingComment: null,
    ratedAt: null,
    requesterRatingScore: null,
    requesterRatingComment: null,
    requesterRatedAt: null,
    staffRatingScore: null,
    staffRatingComment: null,
    staffRatedAt: null,
    createdAt: now(),
    updatedAt: now(),
    attachments: [],
  };
  applyReportAttachmentList(report, body.attachments, 'incident_photo');
  reports.unshift(report);
  return success(res, mapReport(report), 'Report berhasil dibuat', 201);
});

app.patch('/api/reports/:id/status', authRequired, (req, res) => {
  const report = reports.find((item) => item.reportId === Number(req.params.id));
  if (!report) return res.status(404).json({ success: false, message: 'Report tidak ditemukan' });
  report.status = req.body.status;
  report.updatedAt = now();
  return success(res, mapReport(report), 'Status report diperbarui');
});

app.patch('/api/reports/:id/progress', authRequired, roleRequired('admin', 'staff'), (req, res) => {
  const report = reports.find((item) => item.reportId === Number(req.params.id));
  if (!report) return res.status(404).json({ success: false, message: 'Report tidak ditemukan' });
  report.status = 'progress';
  report.assignedStaffId = req.body.assignedStaffId || req.user.userId;
  report.progressStartedAt = now();
  report.arrivedAt = null;
  report.updatedAt = now();
  return success(res, mapReport(report), 'Report mulai diproses');
});

app.patch('/api/reports/:id/arrived', authRequired, roleRequired('admin', 'staff'), (req, res) => {
  const report = reports.find((item) => item.reportId === Number(req.params.id));
  if (!report) return res.status(404).json({ success: false, message: 'Report tidak ditemukan' });
  report.arrivedAt = now();
  report.updatedAt = now();
  return success(res, mapReport(report), 'Lokasi tiba dicatat');
});

app.patch('/api/reports/:id/complete', authRequired, roleRequired('admin', 'staff'), (req, res) => {
  const report = reports.find((item) => item.reportId === Number(req.params.id));
  if (!report) return res.status(404).json({ success: false, message: 'Report tidak ditemukan' });
  report.status = 'close';
  report.completionDescription = req.body.completionDescription;
  report.completedAt = now();
  report.resolutionMinutes = 1;
  applyReportAttachmentList(report, req.body.attachments, 'completion_photo');
  report.updatedAt = now();
  return success(res, mapReport(report), 'Report selesai');
});

app.patch('/api/reports/:id/rate', authRequired, (req, res) => {
  const report = reports.find((item) => item.reportId === Number(req.params.id));
  if (!report) return res.status(404).json({ success: false, message: 'Report tidak ditemukan' });
  const reviewerType = req.body.reviewerType || (report.reporterUserId === req.user.userId ? 'requester' : 'staff');
  const isAdminRole = req.user.role === 'admin' || req.user.role === 'superadmin';
  if (reviewerType === 'requester' && !isAdminRole && report.reporterUserId !== req.user.userId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  if (reviewerType === 'staff' && !isAdminRole && report.assignedStaffId !== req.user.userId) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  if (reviewerType === 'requester') {
    report.ratingScore = Number(req.body.ratingScore);
    report.ratingComment = req.body.ratingComment || null;
    report.ratedAt = now();
    report.requesterRatingScore = report.ratingScore;
    report.requesterRatingComment = report.ratingComment;
    report.requesterRatedAt = report.ratedAt;
  } else {
    report.staffRatingScore = Number(req.body.ratingScore);
    report.staffRatingComment = req.body.ratingComment || null;
    report.staffRatedAt = now();
  }
  report.updatedAt = now();
  return success(res, mapReport(report), 'Rating berhasil disimpan');
});

app.delete('/api/reports/:id', authRequired, roleRequired('admin'), (req, res) => {
  const index = reports.findIndex((item) => item.reportId === Number(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'Report tidak ditemukan' });
  reports.splice(index, 1);
  return success(res, null, 'Report berhasil dihapus');
});

app.post('/api/notifications/register-token', authRequired, (_req, res) => success(res, { registered: true }, 'Token tersimpan'));
app.post('/api/notifications/send-alert', authRequired, roleRequired('admin', 'staff'), (_req, res) => success(res, { sent: true }, 'Alert terkirim'));
app.post('/api/notifications/alert-taken', authRequired, roleRequired('admin', 'staff'), (_req, res) => success(res, { taken: true }, 'Alert diambil'));
app.get('/api/notifications/logs', authRequired, roleRequired('admin'), (_req, res) => success(res, [], 'Log notifikasi'));

app.post('/api/uploads/profile-photo', authRequired, upload.single('file'), (req, res) => {
  const fileName = req.file?.filename || `profile-${Date.now()}.jpg`;
  return success(res, {
    fileName,
    fileUrl: `${BASE_URL}/uploads/${fileName}`,
    mimeType: req.file?.mimetype || 'image/jpeg',
    fileSize: req.file?.size || null,
    kind: 'profile_photo',
  }, 'Upload berhasil', 201);
});

app.post('/api/uploads/report-photo', authRequired, upload.single('file'), (req, res) => {
  const fileName = req.file?.filename || `report-${Date.now()}.jpg`;
  return success(res, {
    fileName,
    fileUrl: `${BASE_URL}/uploads/${fileName}`,
    mimeType: req.file?.mimetype || 'image/jpeg',
    fileSize: req.file?.size || null,
    kind: 'report_photo',
  }, 'Upload berhasil', 201);
});

app.post('/api/uploads/report-completion-photo', authRequired, upload.single('file'), (req, res) => {
  const fileName = req.file?.filename || `completion-${Date.now()}.jpg`;
  return success(res, {
    fileName,
    fileUrl: `${BASE_URL}/uploads/${fileName}`,
    mimeType: req.file?.mimetype || 'image/jpeg',
    fileSize: req.file?.size || null,
    kind: 'completion_photo',
  }, 'Upload berhasil', 201);
});

app.get('/api/docs.json', (_req, res) => {
  res.json({
    openapi: '3.0.3',
    info: { title: 'Security Alert Mock API', version: '1.0.0' },
    servers: [{ url: '/api' }],
  });
});

app.listen(PORT, HOST, () => {
  console.log(`[mock-api] listening on ${BASE_URL}`);
});
