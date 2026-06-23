const { z } = require('zod');

const idParams = z.object({
  id: z.coerce.number().int().positive(),
});

const departmentBody = z.object({
  departmentCode: z.string().min(2),
  departmentName: z.string().min(2),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  isActive: z.coerce.boolean().optional(),
});

module.exports = { idParams, departmentBody };
