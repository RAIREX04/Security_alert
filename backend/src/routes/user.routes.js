const express = require('express');
const userController = require('../controllers/user.controller');
const { asyncHandler } = require('../utils/async-handler');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { idParams, createUserBody, updateUserBody, updateMeBody, approvalBody } = require('../validators/user.validator');

const router = express.Router();

router.use(authenticate);

router.get('/me', asyncHandler(userController.me));
router.get('/me/summary', asyncHandler(userController.profileSummary));
router.put('/me', validate({ body: updateMeBody }), asyncHandler(userController.updateMe));
router.get('/options', requireRole('admin'), asyncHandler(userController.options));
router.get('/pending-staff', requireRole('admin'), asyncHandler(userController.pendingStaff));
router.get('/', requireRole('admin'), asyncHandler(userController.index));
router.get('/:id', requireRole('admin'), validate({ params: idParams }), asyncHandler(userController.show));
router.post('/', requireRole('admin'), validate({ body: createUserBody }), asyncHandler(userController.store));
router.put('/:id', requireRole('admin'), validate({ params: idParams, body: updateUserBody }), asyncHandler(userController.update));
router.delete('/:id', requireRole('admin'), validate({ params: idParams }), asyncHandler(userController.destroy));
router.patch('/:id/approve', requireRole('admin'), validate({ params: idParams, body: approvalBody }), asyncHandler(userController.approve));
router.patch('/:id/reject', requireRole('admin'), validate({ params: idParams, body: approvalBody }), asyncHandler(userController.reject));

module.exports = router;
