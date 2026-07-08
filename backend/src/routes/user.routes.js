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
router.patch('/me', validate({ body: updateMeBody }), asyncHandler(userController.updateMe));
router.post('/me', validate({ body: updateMeBody }), asyncHandler(userController.updateMe));
router.post('/me/update', validate({ body: updateMeBody }), asyncHandler(userController.updateMe));
router.get('/options', requireRole('admin'), asyncHandler(userController.options));
router.get('/pending-staff', requireRole('admin'), asyncHandler(userController.pendingStaff));
router.get('/', requireRole('admin'), asyncHandler(userController.index));
router.get('/:id', requireRole('admin'), validate({ params: idParams }), asyncHandler(userController.show));
router.post('/', requireRole('admin'), validate({ body: createUserBody }), asyncHandler(userController.store));
router.put('/:id', requireRole('admin'), validate({ params: idParams, body: updateUserBody }), asyncHandler(userController.update));
router.patch('/:id', requireRole('admin'), validate({ params: idParams, body: updateUserBody }), asyncHandler(userController.update));
router.post('/:id', requireRole('admin'), validate({ params: idParams, body: updateUserBody }), asyncHandler(userController.update));
router.post('/:id/update', requireRole('admin'), validate({ params: idParams, body: updateUserBody }), asyncHandler(userController.update));
router.delete('/:id', requireRole('admin'), validate({ params: idParams }), asyncHandler(userController.destroy));
router.patch('/:id/approve', requireRole('admin'), validate({ params: idParams, body: approvalBody }), asyncHandler(userController.approve));
router.post('/:id/approve', requireRole('admin'), validate({ params: idParams, body: approvalBody }), asyncHandler(userController.approve));
router.put('/:id/approve', requireRole('admin'), validate({ params: idParams, body: approvalBody }), asyncHandler(userController.approve));
router.patch('/:id/reject', requireRole('admin'), validate({ params: idParams, body: approvalBody }), asyncHandler(userController.reject));
router.post('/:id/reject', requireRole('admin'), validate({ params: idParams, body: approvalBody }), asyncHandler(userController.reject));
router.put('/:id/reject', requireRole('admin'), validate({ params: idParams, body: approvalBody }), asyncHandler(userController.reject));

module.exports = router;
