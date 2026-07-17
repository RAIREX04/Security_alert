const bcrypt = require('bcryptjs');
const { DEFAULT_DEPARTMENTS } = require('../utils/department');
const { Role, Department, User } = require('../models');

async function ensureSeedData() {
  const roleNames = ['superadmin', 'admin', 'staff', 'user', 'view_only'];
  for (const roleName of roleNames) {
    await Role.findOrCreate({
      where: { roleName },
      defaults: { description: roleName.toUpperCase() },
    });
  }

  for (const dept of DEFAULT_DEPARTMENTS) {
    await Department.findOrCreate({
      where: { departmentCode: dept.departmentCode },
      defaults: {
        ...dept,
        isActive: true,
      },
    });
  }

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@emergency.local';
  const adminPin = process.env.DEFAULT_ADMIN_PIN || '123456';
  const [adminRole] = await Role.findAll({ where: { roleName: 'superadmin' }, limit: 1 });
  if (!adminRole) return;

  const adminUser = await User.findOne({ where: { email: adminEmail } });
  if (!adminUser) {
    await User.create({
      roleId: adminRole.roleId,
      fullName: 'Super Admin',
      username: 'admin',
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPin, 12),
      approvalStatus: 'approved',
      approvedAt: new Date(),
      isActive: true,
    });
  }
}

module.exports = { ensureSeedData };
