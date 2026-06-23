const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const reportRoutes = require('./report.routes');
const departmentRoutes = require('./department.routes');
const notificationRoutes = require('./notification.routes');
const uploadRoutes = require('./upload.routes');

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/departments', departmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
