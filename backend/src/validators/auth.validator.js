const { z } = require('zod');

const pinSchema = z.string().regex(/^\d{6}$/, 'PIN wajib tepat 6 angka');
const optionalEmail = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().email().optional().nullable(),
);

const loginBody = z.object({
  username: z.string().min(3),
  pin: pinSchema,
});

const registerUserBody = z.object({
  fullName: z.string().min(3),
  username: z.string().min(3),
  email: optionalEmail,
  pin: pinSchema,
  phoneNumber: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
});

const registerStaffBody = registerUserBody.extend({
  departmentId: z.number().int().positive(),
  jobFunction: z.string().optional().nullable(),
});

const refreshBody = z.object({
  refreshToken: z.string().min(10),
});

const logoutBody = z.object({
  refreshToken: z.string().min(10).optional(),
});

const changePinBody = z.object({
  currentPin: pinSchema,
  newPin: pinSchema,
});

module.exports = {
  loginBody,
  registerUserBody,
  registerStaffBody,
  refreshBody,
  logoutBody,
  changePinBody,
};
