const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const notificationController = require('../controllers/notification.controller');
const { asyncHandler } = require('../utils/async-handler');
const { z } = require('zod');

const router = express.Router();

const registerTokenBody = z.object({
  fcmToken: z.string().min(10),
  platform: z.literal('android').optional(),
  deviceId: z.string().optional().nullable(),
});

const removeTokenBody = z.object({
  fcmToken: z.string().min(10),
});

const sendAlertBody = z.object({
  reportId: z.coerce.number().int().positive().optional().nullable(),
  departmentName: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  title: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const alertTakenBody = z.object({
  reportId: z.coerce.number().int().positive().optional().nullable(),
  departmentName: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
});

router.use(authenticate);

router.post('/register-token', validate({ body: registerTokenBody }), asyncHandler(notificationController.registerToken));
router.post('/remove-token', validate({ body: removeTokenBody }), asyncHandler(notificationController.removeToken));
router.post('/send-alert', requireRole('admin', 'staff'), validate({ body: sendAlertBody }), asyncHandler(notificationController.sendAlert));
router.post('/alert-taken', requireRole('admin', 'staff'), validate({ body: alertTakenBody }), asyncHandler(notificationController.alertTaken));
router.get('/logs', requireRole('admin'), asyncHandler(notificationController.logs));

module.exports = router;
