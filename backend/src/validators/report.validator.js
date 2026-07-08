const { z } = require('zod');

const idParams = z.object({
  id: z.coerce.number().int().positive(),
});

const createReportBody = z.object({
  departmentId: z.coerce.number().int().positive(),
  sourceDepartmentId: z.coerce.number().int().positive().optional().nullable(),
  clientSubmissionId: z.string().min(6).max(100).optional().nullable(),
  description: z.string().min(3),
  incidentLocationText: z.string().min(3),
  incidentLatitude: z.coerce.number().optional().nullable(),
  incidentLongitude: z.coerce.number().optional().nullable(),
  attachments: z.array(
    z.object({
      fileName: z.string().min(1),
      fileUrl: z.string().min(1),
      mimeType: z.string().optional().nullable(),
      fileSize: z.coerce.number().int().optional().nullable(),
      attachmentType: z.enum(['incident_photo']).default('incident_photo'),
    }),
  ).optional(),
});

const statusBody = z.object({
  status: z.enum(['open', 'progress', 'close']),
});

const progressBody = z.object({
  assignedStaffId: z.coerce.number().int().positive().optional().nullable(),
  responderLocation: z.string().min(1).optional().nullable(),
});

const completeBody = z.object({
  completionDescription: z.string().min(3),
  responderLocation: z.string().min(1).optional().nullable(),
  attachments: z.array(
    z.object({
      fileName: z.string().min(1),
      fileUrl: z.string().min(1),
      mimeType: z.string().optional().nullable(),
      fileSize: z.coerce.number().int().optional().nullable(),
      attachmentType: z.enum(['completion_photo']).default('completion_photo'),
    }),
  ).optional(),
});

const rateBody = z.object({
  ratingScore: z.coerce.number().int().min(1).max(5),
  ratingComment: z.string().optional().nullable(),
  reviewerType: z.enum(['requester', 'staff']).optional(),
});

module.exports = {
  idParams,
  createReportBody,
  statusBody,
  progressBody,
  completeBody,
  rateBody,
};
