const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
  Role,
  Department,
  User,
  RefreshToken,
} = require('../models');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../config/jwt');

function sanitizeUser(user) {
  if (!user) return null;
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
    role: user.Role ? user.Role.roleName : undefined,
    department: user.Department ? user.Department.departmentName : undefined,
  };
}

async function loadRole(roleName) {
  const role = await Role.findOne({ where: { roleName } });
  if (!role) {
    throw Object.assign(new Error(`Role ${roleName} tidak ditemukan`), {
      statusCode: 500,
    });
  }
  return role;
}

async function ensureUniqueUser({ username, email, excludeUserId = null }) {
  const where = [];
  if (username) where.push({ username });
  if (email) where.push({ email });

  for (const clause of where) {
    const existing = await User.findOne({ where: clause });
    if (existing && existing.userId !== excludeUserId) {
      throw Object.assign(new Error('Username atau email sudah terdaftar'), {
        statusCode: 409,
      });
    }
  }
}

function resolveEmail(username, email) {
  return email?.trim().toLowerCase() || `${username.trim().toLowerCase()}@emergency.local`;
}

async function createUserAccount(payload, roleName, approvalStatus = 'approved') {
  const role = await loadRole(roleName);
  const email = resolveEmail(payload.username, payload.email);
  await ensureUniqueUser({ username: payload.username, email });

  const user = await User.create({
    roleId: role.roleId,
    departmentId: payload.departmentId || null,
    fullName: payload.fullName,
    username: payload.username.toLowerCase(),
    email,
    passwordHash: await bcrypt.hash(payload.pin, 12),
    phoneNumber: payload.phoneNumber || null,
    photoUrl: payload.photoUrl || null,
    approvalStatus,
    approvedAt: approvalStatus === 'approved' ? new Date() : null,
    isActive: true,
  });

  return sanitizeUser(await User.findByPk(user.userId, { include: [Role, Department] }));
}

async function login(username, pin) {
  const normalizedUsername = String(username).trim().toLowerCase();
  const user = await User.findOne({
    where: { username: normalizedUsername },
    include: [Role, Department],
  });

  if (!user || !user.isActive) {
    throw Object.assign(new Error('Akun tidak ditemukan'), { statusCode: 401 });
  }

  const validPin = await bcrypt.compare(pin, user.passwordHash);
  if (!validPin) {
    throw Object.assign(new Error('Username atau PIN salah'), {
      statusCode: 401,
    });
  }

  if (user.Role?.roleName === 'staff' && user.approvalStatus !== 'approved') {
    throw Object.assign(new Error('Akun staff belum disetujui admin'), {
      statusCode: 403,
    });
  }

  const accessToken = signAccessToken({
    sub: String(user.userId),
    role: user.Role.roleName,
    departmentId: user.departmentId,
    approvalStatus: user.approvalStatus,
    email: user.email,
    username: user.username,
    name: user.fullName,
  });

  const refreshToken = signRefreshToken({
    sub: String(user.userId),
    jti: crypto.randomUUID(),
  });

  await RefreshToken.create({
    userId: user.userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

async function refresh(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOne({
    where: {
      userId: Number(payload.sub),
      tokenHash,
      revokedAt: null,
    },
  });

  if (!stored) {
    throw Object.assign(new Error('Refresh token tidak valid'), { statusCode: 401 });
  }

  const user = await User.findByPk(Number(payload.sub), { include: [Role, Department] });
  if (!user || !user.isActive) {
    throw Object.assign(new Error('Akun tidak aktif'), { statusCode: 401 });
  }

  stored.revokedAt = new Date();
  await stored.save();

  const nextAccessToken = signAccessToken({
    sub: String(user.userId),
    role: user.Role.roleName,
    departmentId: user.departmentId,
    approvalStatus: user.approvalStatus,
    email: user.email,
    username: user.username,
    name: user.fullName,
  });
  const nextRefreshToken = signRefreshToken({
    sub: String(user.userId),
    jti: crypto.randomUUID(),
  });

  await RefreshToken.create({
    userId: user.userId,
    tokenHash: hashToken(nextRefreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    user: sanitizeUser(user),
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  };
}

async function logout(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await RefreshToken.update(
    { revokedAt: new Date() },
    {
      where: {
        tokenHash,
        revokedAt: null,
      },
    },
  );
}

async function changePin(userId, currentPin, newPin) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw Object.assign(new Error('Akun tidak ditemukan'), { statusCode: 404 });
  }

  const valid = await bcrypt.compare(currentPin, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('PIN saat ini salah'), { statusCode: 400 });
  }

  user.passwordHash = await bcrypt.hash(newPin, 12);
  await user.save();
  await RefreshToken.update(
    { revokedAt: new Date() },
    { where: { userId } },
  );

  return true;
}

async function me(userId) {
  const user = await User.findByPk(userId, { include: [Role, Department] });
  return sanitizeUser(user);
}

async function registerUser(payload) {
  return createUserAccount(payload, 'user', 'approved');
}

async function registerStaff(payload) {
  return createUserAccount(payload, 'staff', 'pending');
}

async function createStaffByAdmin(payload, adminUserId) {
  const created = await createUserAccount(
    {
      ...payload,
      departmentId: payload.departmentId || null,
    },
    'staff',
    'approved',
  );

  await User.update(
    {
      approvedByUserId: adminUserId,
      approvedAt: new Date(),
    },
    { where: { userId: created.userId } },
  );

  return me(created.userId);
}

module.exports = {
  sanitizeUser,
  registerUser,
  registerStaff,
  createStaffByAdmin,
  login,
  refresh,
  logout,
  changePin,
  me,
};
