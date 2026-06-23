const { success } = require('../utils/api-response');
const userService = require('../services/user.service');

async function index(req, res) {
  const data = await userService.listUsers({
    role: req.query.role,
    q: req.query.q,
    departmentId: req.query.departmentId ? Number(req.query.departmentId) : null,
    approvalStatus: req.query.approvalStatus,
  });
  return success(res, data, 'Daftar user');
}

async function show(req, res) {
  const data = await userService.getUser(req.validated.params.id);
  return success(res, data, 'Detail user');
}

async function store(req, res) {
  const data = await userService.createUser(req.validated.body);
  return success(res, data, 'User berhasil dibuat', 201);
}

async function update(req, res) {
  const data = await userService.updateUser(req.validated.params.id, req.validated.body);
  return success(res, data, 'User berhasil diperbarui');
}

async function updateMe(req, res) {
  const data = await userService.updateUser(Number(req.user.sub), req.validated.body);
  return success(res, data, 'Profil berhasil diperbarui');
}

async function options(req, res) {
  const data = await userService.getOptions();
  return success(res, data, 'Opsi form user');
}

async function destroy(req, res) {
  await userService.deleteUser(req.validated.params.id);
  return success(res, null, 'User berhasil dihapus');
}

async function pendingStaff(req, res) {
  const data = await userService.listPendingStaff();
  return success(res, data, 'Daftar staff pending');
}

async function approve(req, res) {
  const data = await userService.approveUser(
    req.validated.params.id,
    Number(req.user.sub),
    'approved',
  );
  return success(res, data, 'Staff disetujui');
}

async function reject(req, res) {
  const data = await userService.approveUser(
    req.validated.params.id,
    Number(req.user.sub),
    'rejected',
  );
  return success(res, data, 'Staff ditolak');
}

async function me(req, res) {
  const data = await userService.me(Number(req.user.sub));
  return success(res, data, 'Profil aktif');
}

async function profileSummary(req, res) {
  const data = await userService.profileSummary(Number(req.user.sub));
  return success(res, data, 'Ringkasan profil');
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  pendingStaff,
  approve,
  reject,
  me,
  profileSummary,
  updateMe,
  options,
};
