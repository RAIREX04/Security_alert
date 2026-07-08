const express = require('express');
const reportController = require('../controllers/report.controller');
const { asyncHandler } = require('../utils/async-handler');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const {
  idParams,
  createReportBody,
  statusBody,
  progressBody,
  completeBody,
  rateBody,
} = require('../validators/report.validator');

const router = express.Router();

router.use(authenticate);

router.get('/department/:id', requireRole('admin', 'staff'), validate({ params: idParams }), asyncHandler(reportController.byDepartment));
router.get('/user/:id', validate({ params: idParams }), asyncHandler(reportController.byUser));
router.get('/staff/:id', requireRole('admin'), validate({ params: idParams }), asyncHandler(reportController.byStaff));

router.get('/', asyncHandler(reportController.index));
router.get('/:id', validate({ params: idParams }), asyncHandler(reportController.show));
router.post('/', validate({ body: createReportBody }), asyncHandler(reportController.store));
router.patch('/:id/status', validate({ params: idParams, body: statusBody }), asyncHandler(reportController.updateStatus));
router.post('/:id/status', validate({ params: idParams, body: statusBody }), asyncHandler(reportController.updateStatus));
router.put('/:id/status', validate({ params: idParams, body: statusBody }), asyncHandler(reportController.updateStatus));
router.post('/:id/update-status', validate({ params: idParams, body: statusBody }), asyncHandler(reportController.updateStatus));
router.patch('/:id/progress', requireRole('admin', 'staff'), validate({ params: idParams, body: progressBody }), asyncHandler(reportController.startProgress));
router.post('/:id/progress', requireRole('admin', 'staff'), validate({ params: idParams, body: progressBody }), asyncHandler(reportController.startProgress));
router.put('/:id/progress', requireRole('admin', 'staff'), validate({ params: idParams, body: progressBody }), asyncHandler(reportController.startProgress));
router.post('/:id/start-progress', requireRole('admin', 'staff'), validate({ params: idParams, body: progressBody }), asyncHandler(reportController.startProgress));
router.patch('/:id/arrived', requireRole('admin', 'staff'), validate({ params: idParams, body: progressBody }), asyncHandler(reportController.arrived));
router.post('/:id/arrived', requireRole('admin', 'staff'), validate({ params: idParams, body: progressBody }), asyncHandler(reportController.arrived));
router.put('/:id/arrived', requireRole('admin', 'staff'), validate({ params: idParams, body: progressBody }), asyncHandler(reportController.arrived));
router.patch('/:id/complete', requireRole('admin', 'staff'), validate({ params: idParams, body: completeBody }), asyncHandler(reportController.complete));
router.post('/:id/complete', requireRole('admin', 'staff'), validate({ params: idParams, body: completeBody }), asyncHandler(reportController.complete));
router.put('/:id/complete', requireRole('admin', 'staff'), validate({ params: idParams, body: completeBody }), asyncHandler(reportController.complete));
router.patch('/:id/rate', validate({ params: idParams, body: rateBody }), asyncHandler(reportController.rate));
router.post('/:id/rate', validate({ params: idParams, body: rateBody }), asyncHandler(reportController.rate));
router.put('/:id/rate', validate({ params: idParams, body: rateBody }), asyncHandler(reportController.rate));
router.delete('/:id', requireRole('admin'), validate({ params: idParams }), asyncHandler(reportController.destroy));

module.exports = router;
