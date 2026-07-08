const { z } = require('zod');

const passwordSchema = z.string().min(6, 'Password minimal 6 karakter');
const optionalEmail = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().email().optional().nullable(),
);

const loginBody = z.object({
  username: z.string().min(3),
  pin: passwordSchema,
});

const registerUserBody = z.object({
  fullName: z.string().min(3),
  username: z.string().min(3),
  email: optionalEmail,
  pin: passwordSchema,
  phoneNumber: z.string().optional().nullable(),
  photoUrl: z.string().min(1, 'Foto profil wajib ditambahkan'),
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
  currentPin: passwordSchema,
  newPin: passwordSchema,
});

module.exports = {
  loginBody,
  registerUserBody,
  registerStaffBody,
  refreshBody,
  logoutBody,
  changePinBody,
};
