const { success } = require('../utils/api-response');
const departmentService = require('../services/department.service');

async function index(req, res) {
  const data = await departmentService.listDepartments();
  return success(res, data, 'Daftar departemen');
}

async function show(req, res) {
  const data = await departmentService.getDepartment(req.validated.params.id);
  return success(res, data, 'Detail departemen');
}

async function store(req, res) {
  const data = await departmentService.createDepartment(req.validated.body);
  return success(res, data, 'Departemen berhasil dibuat', 201);
}

async function update(req, res) {
  const data = await departmentService.updateDepartment(req.validated.params.id, req.validated.body);
  return success(res, data, 'Departemen berhasil diperbarui');
}

async function destroy(req, res) {
  await departmentService.deleteDepartment(req.validated.params.id);
  return success(res, null, 'Departemen berhasil dihapus');
}

async function stats(req, res) {
  const data = await departmentService.getDepartmentStats(req.validated.params.id);
  return success(res, data, 'Statistik departemen');
}

module.exports = { index, show, store, update, destroy, stats };
