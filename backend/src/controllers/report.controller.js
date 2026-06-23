const { success } = require('../utils/api-response');
const reportService = require('../services/report.service');

async function index(req, res) {
  const data = await reportService.listReports(req.user, req.query);
  return success(res, data, 'Daftar report');
}

async function show(req, res) {
  const data = await reportService.getReport(req.user, req.validated.params.id);
  return success(res, data, 'Detail report');
}

async function store(req, res) {
  const data = await reportService.createReport(req.user, req.validated.body);
  return success(res, data, 'Report berhasil dibuat', 201);
}

async function updateStatus(req, res) {
  const data = await reportService.updateReportStatus(
    req.user,
    req.validated.params.id,
    req.validated.body.status,
  );
  return success(res, data, 'Status report diperbarui');
}

async function startProgress(req, res) {
  const data = await reportService.startProgress(
    req.user,
    req.validated.params.id,
    req.validated.body,
  );
  return success(res, data, 'Report mulai diproses');
}

async function arrived(req, res) {
  const data = await reportService.markArrived(req.user, req.validated.params.id, req.validated.body);
  return success(res, data, 'Lokasi tiba dicatat');
}

async function complete(req, res) {
  const data = await reportService.completeReport(req.user, req.validated.params.id, req.validated.body);
  return success(res, data, 'Report selesai');
}

async function rate(req, res) {
  const data = await reportService.rateReport(req.user, req.validated.params.id, req.validated.body);
  return success(res, data, 'Rating berhasil disimpan');
}

async function destroy(req, res) {
  await reportService.deleteReport(req.validated.params.id);
  return success(res, null, 'Report berhasil dihapus');
}

async function byDepartment(req, res) {
  const data = await reportService.reportsByDepartment(req.user, req.validated.params.id);
  return success(res, data, 'Report per departemen');
}

async function byUser(req, res) {
  const data = await reportService.reportsByUser(req.user, req.validated.params.id);
  return success(res, data, 'Report per user');
}

async function byStaff(req, res) {
  const data = await reportService.reportsByStaff(req.user, req.validated.params.id);
  return success(res, data, 'Report per staff');
}

module.exports = {
  index,
  show,
  store,
  updateStatus,
  startProgress,
  arrived,
  complete,
  rate,
  destroy,
  byDepartment,
  byUser,
  byStaff,
};
