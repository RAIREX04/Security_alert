const { z } = require('zod');
const passwordSchema = z.string().min(6, 'Password minimal 6 karakter');
const optionalEmail = z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().email().optional().nullable(),
);

const idParams = z.object({
  id: z.coerce.number().int().positive(),
});

const createUserBody = z.object({
  fullName: z.string().min(3),
  username: z.string().min(3),
  email: optionalEmail,
  pin: passwordSchema,
  roleId: z.coerce.number().int().positive().optional(),
  roleName: z.enum(['admin', 'staff', 'user']).optional(),
  departmentId: z.coerce.number().int().positive().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
}).refine((data) => data.roleId || data.roleName, {
  message: 'roleId atau roleName wajib diisi',
});

const updateUserBody = z.object({
  fullName: z.string().min(3).optional(),
  username: z.string().min(3).optional(),
  email: optionalEmail,
  pin: passwordSchema.optional(),
  roleId: z.coerce.number().int().positive().optional(),
  departmentId: z.coerce.number().int().positive().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  isActive: z.boolean().optional(),
});

const updateMeBody = updateUserBody.pick({
  fullName: true,
  username: true,
  email: true,
  pin: true,
  phoneNumber: true,
  photoUrl: true,
});

const approvalBody = z.object({}).passthrough();

module.exports = { idParams, createUserBody, updateUserBody, updateMeBody, approvalBody };
