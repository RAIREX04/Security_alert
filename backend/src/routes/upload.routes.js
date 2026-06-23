const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { upload } = require('../services/upload.service');
const uploadController = require('../controllers/upload.controller');
const { asyncHandler } = require('../utils/async-handler');

const router = express.Router();

router.use(authenticate);
router.post('/profile-photo', upload.single('file'), asyncHandler(uploadController.uploadProfilePhoto));
router.post('/report-photo', upload.single('file'), asyncHandler(uploadController.uploadReportPhoto));
router.post('/report-completion-photo', upload.single('file'), asyncHandler(uploadController.uploadReportCompletionPhoto));

module.exports = router;
