const { Department, User, Report } = require('../models');
const { DEFAULT_DEPARTMENTS } = require('../utils/department');

function mapDepartment(dept) {
  if (!dept) return null;
  return {
    departmentId: dept.departmentId,
    departmentCode: dept.departmentCode,
    departmentName: dept.departmentName,
    description: dept.description,
    icon: dept.icon,
    color: dept.color,
    isActive: dept.isActive,
  };
}

async function listDepartments() {
  const departments = await Department.findAll({ order: [['departmentName', 'ASC']] });
  return departments.map(mapDepartment);
}

async function getDepartment(id) {
  const department = await Department.findByPk(id);
  return mapDepartment(department);
}

async function createDepartment(payload) {
  const department = await Department.create(payload);
  return mapDepartment(department);
}

async function updateDepartment(id, payload) {
  const department = await Department.findByPk(id);
  if (!department) {
    throw Object.assign(new Error('Departemen tidak ditemukan'), { statusCode: 404 });
  }
  await department.update(payload);
  return mapDepartment(department);
}

async function deleteDepartment(id) {
  const count = await Department.destroy({ where: { departmentId: id } });
  return count > 0;
}

async function getDepartmentStats(id) {
  const [totalUsers, totalStaff, totalReports, openReports, progressReports, closeReports] =
    await Promise.all([
      User.count({ where: { departmentId: id } }),
      User.count({ where: { departmentId: id, approvalStatus: 'approved' } }),
      Report.count({ where: { departmentId: id } }),
      Report.count({ where: { departmentId: id, status: 'open' } }),
      Report.count({ where: { departmentId: id, status: 'progress' } }),
      Report.count({ where: { departmentId: id, status: 'close' } }),
    ]);

  return {
    totalUsers,
    totalStaff,
    totalReports,
    openReports,
    progressReports,
    closeReports,
  };
}

module.exports = {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
  DEFAULT_DEPARTMENTS,
};
