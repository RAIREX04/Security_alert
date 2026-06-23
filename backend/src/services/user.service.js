const bcrypt = require('bcryptjs');
const { Op, QueryTypes } = require('sequelize');
const {
  sequelize,
  Role,
  Department,
  User,
  Report,
  RefreshToken,
  UserToken,
  AuditLog,
} = require('../models');
const { sanitizeUser } = require('./auth.service');

async function listUsers({ role, q, departmentId, approvalStatus }) {
  const where = {};
  if (role) where.roleId = (await Role.findOne({ where: { roleName: role } }))?.roleId || null;
  if (departmentId) where.departmentId = departmentId;
  if (approvalStatus) where.approvalStatus = approvalStatus;
  if (q) {
    where[Op.or] = [
      { fullName: { [Op.like]: `%${q}%` } },
      { username: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
    ];
  }

  const users = await User.findAll({
    where,
    include: [Role, Department],
    order: [['fullName', 'ASC']],
  });
  return users.map(sanitizeUser);
}

async function getUser(id) {
  const user = await User.findByPk(id, { include: [Role, Department] });
  return sanitizeUser(user);
}

async function ensureReportReporterCanBeDeleted(transaction) {
  const [column] = await sequelize.query(
    `
      SELECT IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'reports' AND COLUMN_NAME = 'reporter_user_id'
    `,
    { type: QueryTypes.SELECT, transaction },
  );

  if (column?.IS_NULLABLE === 'YES') {
    return;
  }

  await sequelize.query(
    `
      IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_reports_reporter_users')
        ALTER TABLE reports DROP CONSTRAINT FK_reports_reporter_users;
    `,
    { transaction },
  );

  await sequelize.query(
    `
      ALTER TABLE reports ALTER COLUMN reporter_user_id INT NULL;
    `,
    { transaction },
  );

  await sequelize.query(
    `
      ALTER TABLE reports
      ADD CONSTRAINT FK_reports_reporter_users
      FOREIGN KEY (reporter_user_id) REFERENCES users(user_id)
      ON DELETE SET NULL;
    `,
    { transaction },
  );
}

async function createUser(payload) {
  const role = payload.roleId
    ? await Role.findByPk(payload.roleId)
    : await Role.findOne({ where: { roleName: payload.roleName } });
  if (!role) {
    throw Object.assign(new Error('Role tidak ditemukan'), { statusCode: 404 });
  }

  const email = payload.email?.trim().toLowerCase() || `${payload.username.trim().toLowerCase()}@emergency.local`;
  const exists = await User.findOne({
    where: {
      [Op.or]: [{ username: payload.username }, { email }],
    },
  });
  if (exists) {
    throw Object.assign(new Error('Username atau email sudah terdaftar'), {
      statusCode: 409,
    });
  }

  const user = await User.create({
    roleId: role.roleId,
    departmentId: payload.departmentId || null,
    fullName: payload.fullName,
    username: payload.username.toLowerCase(),
    email,
    passwordHash: await bcrypt.hash(payload.pin, 12),
    phoneNumber: payload.phoneNumber || null,
    photoUrl: payload.photoUrl || null,
    approvalStatus: payload.approvalStatus || 'approved',
    approvedAt: payload.approvalStatus === 'pending' ? null : new Date(),
    isActive: true,
  });

  return getUser(user.userId);
}

async function updateUser(id, payload) {
  const user = await User.findByPk(id);
  if (!user) {
    throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 });
  }

  const next = { ...payload };
  delete next.roleName;
  if (payload.pin) {
    next.passwordHash = await bcrypt.hash(payload.pin, 12);
    delete next.pin;
  }
  if (payload.username) next.username = payload.username.toLowerCase();
  if (payload.email) next.email = payload.email.toLowerCase();

  await user.update(next);
  return getUser(id);
}

async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) {
    throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 });
  }

  await sequelize.transaction(async (transaction) => {
    await ensureReportReporterCanBeDeleted(transaction);

    await RefreshToken.destroy({ where: { userId: id }, transaction });
    await UserToken.destroy({ where: { userId: id }, transaction });
    await Report.update({ reporterUserId: null }, { where: { reporterUserId: id }, transaction });
    await Report.update({ assignedStaffId: null }, { where: { assignedStaffId: id }, transaction });
    await User.update({ approvedByUserId: null }, { where: { approvedByUserId: id }, transaction });
    await AuditLog.update({ actorUserId: null }, { where: { actorUserId: id }, transaction });

    await user.destroy({ transaction });
  });

  return true;
}

async function getOptions() {
  const [roles, departments] = await Promise.all([
    Role.findAll({ order: [['roleName', 'ASC']] }),
    Department.findAll({ order: [['departmentName', 'ASC']] }),
  ]);
  return {
    roles: roles.map((role) => ({ roleId: role.roleId, roleName: role.roleName })),
    departments: departments.map((department) => ({
      departmentId: department.departmentId,
      departmentName: department.departmentName,
    })),
  };
}

async function listPendingStaff() {
  const staffRole = await Role.findOne({ where: { roleName: 'staff' } });
  const users = await User.findAll({
    where: {
      roleId: staffRole?.roleId,
      approvalStatus: 'pending',
    },
    include: [Role, Department],
    order: [['fullName', 'ASC']],
  });
  return users.map(sanitizeUser);
}

async function approveUser(id, adminUserId, status = 'approved') {
  const user = await User.findByPk(id);
  if (!user) {
    throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 });
  }
  user.approvalStatus = status;
  user.approvedByUserId = adminUserId;
  user.approvedAt = new Date();
  await user.save();
  return getUser(id);
}

async function me(userId) {
  return getUser(userId);
}

async function profileSummary(userId) {
  const reportsHandled = await Report.count({ where: { assignedStaffId: userId } });
  const reportsCreated = await Report.count({ where: { reporterUserId: userId } });
  return { reportsHandled, reportsCreated };
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listPendingStaff,
  approveUser,
  me,
  profileSummary,
  getOptions,
};
