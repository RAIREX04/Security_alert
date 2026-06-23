const express = require('express');
const departmentController = require('../controllers/department.controller');
const { asyncHandler } = require('../utils/async-handler');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { idParams, departmentBody } = require('../validators/department.validator');

const router = express.Router();

router.get('/', authenticate, asyncHandler(departmentController.index));
router.get('/:id', authenticate, validate({ params: idParams }), asyncHandler(departmentController.show));
router.get('/:id/stats', authenticate, requireRole('admin'), validate({ params: idParams }), asyncHandler(departmentController.stats));
router.post('/', authenticate, requireRole('admin'), validate({ body: departmentBody }), asyncHandler(departmentController.store));
router.put('/:id', authenticate, requireRole('admin'), validate({ params: idParams, body: departmentBody }), asyncHandler(departmentController.update));
router.delete('/:id', authenticate, requireRole('admin'), validate({ params: idParams }), asyncHandler(departmentController.destroy));

module.exports = router;
