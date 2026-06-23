const express = require('express');
const authController = require('../controllers/auth.controller');
const { asyncHandler } = require('../utils/async-handler');
const { validate } = require('../middlewares/validation.middleware');
const {
  loginBody,
  registerUserBody,
  registerStaffBody,
  refreshBody,
  logoutBody,
  changePinBody,
} = require('../validators/auth.validator');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', validate({ body: loginBody }), asyncHandler(authController.login));
router.post('/register-user', validate({ body: registerUserBody }), asyncHandler(authController.registerUser));
router.post('/register-staff', validate({ body: registerStaffBody }), asyncHandler(authController.registerStaff));
router.post('/refresh', validate({ body: refreshBody }), asyncHandler(authController.refresh));
router.post('/logout', validate({ body: logoutBody }), asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.me));
router.patch('/change-pin', authenticate, validate({ body: changePinBody }), asyncHandler(authController.changePin));

module.exports = router;
