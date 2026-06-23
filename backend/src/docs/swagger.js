const swaggerUi = require('swagger-ui-express');

const successEnvelope = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: 'OK' },
  },
};

const errorEnvelope = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string', example: 'Terjadi kesalahan' },
    errors: {
      type: ['array', 'null'],
      items: { type: 'object' },
    },
  },
};

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Management Emergency API',
    version: '1.0.0',
    description: 'API untuk workflow user, staff, dan admin pada aplikasi emergency alert.',
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Reports' },
    { name: 'Departments' },
    { name: 'Notifications' },
    { name: 'Uploads' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['username', 'pin'],
        properties: {
          username: { type: 'string', example: 'admin' },
          pin: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
        },
      },
      AuthSession: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      User: {
        type: 'object',
        properties: {
          userId: { type: 'integer', example: 1 },
          roleId: { type: 'integer', example: 2 },
          departmentId: { type: ['integer', 'null'], example: 3 },
          fullName: { type: 'string', example: 'Budi Santoso' },
          username: { type: 'string', example: 'budi' },
          email: { type: 'string', example: 'budi@example.com' },
          phoneNumber: { type: ['string', 'null'], example: '08123456789' },
          photoUrl: { type: ['string', 'null'], example: 'https://example.com/uploads/profile.png' },
          approvalStatus: { type: 'string', example: 'approved' },
          approvedByUserId: { type: ['integer', 'null'], example: 1 },
          approvedAt: { type: ['string', 'null'], format: 'date-time' },
          isActive: { type: 'boolean', example: true },
          lastLoginAt: { type: ['string', 'null'], format: 'date-time' },
          role: { type: 'string', example: 'user' },
          department: { type: ['string', 'null'], example: 'Security' },
        },
      },
      Department: {
        type: 'object',
        properties: {
          departmentId: { type: 'integer', example: 1 },
          departmentCode: { type: 'string', example: 'SEC' },
          departmentName: { type: 'string', example: 'Security' },
          description: { type: ['string', 'null'], example: 'Tim pengamanan area' },
          icon: { type: ['string', 'null'], example: 'shield' },
          color: { type: ['string', 'null'], example: '#1D4ED8' },
          isActive: { type: 'boolean', example: true },
        },
      },
      ReportAttachment: {
        type: 'object',
        properties: {
          attachmentId: { type: 'integer', example: 1 },
          reportId: { type: 'integer', example: 10 },
          attachmentType: { type: 'string', example: 'incident_photo' },
          fileName: { type: 'string', example: 'incident.jpg' },
          fileUrl: { type: 'string', example: 'https://example.com/uploads/incident.jpg' },
          mimeType: { type: ['string', 'null'], example: 'image/jpeg' },
          fileSize: { type: ['integer', 'null'], example: 245678 },
        },
      },
      Report: {
        type: 'object',
        properties: {
          reportId: { type: 'integer', example: 10 },
          departmentId: { type: 'integer', example: 3 },
          sourceDepartmentId: { type: ['integer', 'null'], example: 2 },
          reporterUserId: { type: 'integer', example: 7 },
          assignedStaffId: { type: ['integer', 'null'], example: 12 },
          description: { type: 'string', example: 'Alarm kebakaran di gedung A' },
          incidentLocationText: { type: 'string', example: 'Lobby Gedung A' },
          incidentLatitude: { type: ['number', 'null'], example: -6.2 },
          incidentLongitude: { type: ['number', 'null'], example: 106.8 },
          status: { type: 'string', example: 'open' },
          progressStartedAt: { type: ['string', 'null'], format: 'date-time' },
          arrivedAt: { type: ['string', 'null'], format: 'date-time' },
          completedAt: { type: ['string', 'null'], format: 'date-time' },
          resolutionMinutes: { type: ['integer', 'null'], example: 24 },
          completionDescription: { type: ['string', 'null'], example: 'Api berhasil dipadamkan' },
          ratingScore: { type: ['integer', 'null'], example: 5 },
          ratingComment: { type: ['string', 'null'], example: 'Respons cepat dan jelas' },
          ratedAt: { type: ['string', 'null'], format: 'date-time' },
          requesterRatingScore: { type: ['integer', 'null'], example: 5 },
          requesterRatingComment: { type: ['string', 'null'], example: 'Respons cepat dan jelas' },
          requesterRatedAt: { type: ['string', 'null'], format: 'date-time' },
          staffRatingScore: { type: ['integer', 'null'], example: 5 },
          staffRatingComment: { type: ['string', 'null'], example: 'Pengambilan tugas sangat cepat' },
          staffRatedAt: { type: ['string', 'null'], format: 'date-time' },
          requesterReviewPending: { type: 'boolean', example: true },
          staffReviewPending: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          department: { type: ['string', 'null'], example: 'Security' },
          sourceDepartment: { type: ['string', 'null'], example: 'Engineering' },
          reporter: {
            type: 'object',
            nullable: true,
            properties: {
              userId: { type: 'integer', example: 7 },
              fullName: { type: 'string', example: 'Budi Santoso' },
              email: { type: 'string', example: 'budi@example.com' },
            },
          },
          assignedStaff: {
            type: 'object',
            nullable: true,
            properties: {
              userId: { type: 'integer', example: 12 },
              fullName: { type: 'string', example: 'Siti Aminah' },
              email: { type: 'string', example: 'siti@example.com' },
            },
          },
          attachments: {
            type: 'array',
            items: { $ref: '#/components/schemas/ReportAttachment' },
          },
        },
      },
      ApiSuccessEnvelope: {
        allOf: [
          successEnvelope,
          {
            type: 'object',
            properties: {
              data: {},
            },
          },
        ],
      },
      ApiErrorEnvelope: errorEnvelope,
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login dengan username dan PIN',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login berhasil',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/AuthSession' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: 'Login gagal', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiErrorEnvelope' } } } },
        },
      },
    },
    '/auth/register-user': {
      post: { tags: ['Auth'], summary: 'Register user', responses: { 201: { description: 'Berhasil' } } },
    },
    '/auth/register-staff': {
      post: { tags: ['Auth'], summary: 'Register staff', responses: { 201: { description: 'Berhasil' } } },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Profil aktif',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profil aktif',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/User' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      post: { tags: ['Auth'], summary: 'Refresh token', responses: { 200: { description: 'Token diperbarui' } } },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout', responses: { 200: { description: 'Logout berhasil' } } },
    },
    '/auth/change-pin': {
      patch: { tags: ['Auth'], summary: 'Ubah PIN', security: [{ bearerAuth: [] }], responses: { 200: { description: 'PIN diperbarui' } } },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Daftar user',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: { tags: ['Users'], summary: 'Create user', security: [{ bearerAuth: [] }], responses: { 201: { description: 'User dibuat' } } },
    },
    '/users/me': {
      put: { tags: ['Users'], summary: 'Update profil aktif', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Profil diperbarui' } } },
    },
    '/users/me/summary': {
      get: {
        tags: ['Users'],
        summary: 'Ringkasan profil aktif',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Summary profil',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            reportsHandled: { type: 'integer', example: 4 },
                            reportsCreated: { type: 'integer', example: 11 },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/users/options': {
      get: { tags: ['Users'], summary: 'Opsi form user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Opsi form' } } },
    },
    '/users/pending-staff': {
      get: {
        tags: ['Users'],
        summary: 'Staff pending approval',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Daftar staff pending',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Detail user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Detail user' } },
      },
      put: { tags: ['Users'], summary: 'Update user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'User diperbarui' } } },
      delete: { tags: ['Users'], summary: 'Nonaktifkan user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'User dihapus' } } },
    },
    '/users/{id}/approve': {
      patch: { tags: ['Users'], summary: 'Approve staff', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Staff disetujui' } } },
    },
    '/users/{id}/reject': {
      patch: { tags: ['Users'], summary: 'Reject staff', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Staff ditolak' } } },
    },
    '/reports': {
      get: {
        tags: ['Reports'],
        summary: 'List reports',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Daftar report',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiSuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Report' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: { tags: ['Reports'], summary: 'Create report', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Report dibuat' } } },
    },
    '/reports/{id}': {
      get: {
        tags: ['Reports'],
        summary: 'Detail report',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Detail report' } },
      },
      delete: { tags: ['Reports'], summary: 'Hapus report', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Report dihapus' } } },
    },
    '/reports/{id}/status': {
      patch: { tags: ['Reports'], summary: 'Ubah status report', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Status diperbarui' } } },
    },
    '/reports/{id}/progress': {
      patch: { tags: ['Reports'], summary: 'Ambil task / progress', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Report diproses' } } },
    },
    '/reports/{id}/arrived': {
      patch: { tags: ['Reports'], summary: 'Tandai arrived', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Lokasi tiba dicatat' } } },
    },
    '/reports/{id}/complete': {
      patch: { tags: ['Reports'], summary: 'Selesaikan report', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Report selesai' } } },
    },
    '/reports/{id}/rate': {
      patch: { tags: ['Reports'], summary: 'Kirim rating', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Rating tersimpan' } } },
    },
    '/reports/department/{id}': {
      get: { tags: ['Reports'], summary: 'Report per departemen', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Report departemen' } } },
    },
    '/reports/user/{id}': {
      get: { tags: ['Reports'], summary: 'Report per user', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Report user' } } },
    },
    '/reports/staff/{id}': {
      get: { tags: ['Reports'], summary: 'Report per staff', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Report staff' } } },
    },
    '/departments': {
      get: { tags: ['Departments'], summary: 'List departments', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Daftar departemen' } } },
      post: { tags: ['Departments'], summary: 'Create department', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Departemen dibuat' } } },
    },
    '/departments/{id}': {
      get: { tags: ['Departments'], summary: 'Detail department', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Detail departemen' } } },
      put: { tags: ['Departments'], summary: 'Update department', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Departemen diperbarui' } } },
      delete: { tags: ['Departments'], summary: 'Delete department', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Departemen dihapus' } } },
    },
    '/departments/{id}/stats': {
      get: { tags: ['Departments'], summary: 'Statistik departemen', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Statistik departemen' } } },
    },
    '/notifications/register-token': {
      post: { tags: ['Notifications'], summary: 'Register push token', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Token tersimpan' } } },
    },
    '/notifications/send-alert': {
      post: { tags: ['Notifications'], summary: 'Kirim alert notifikasi', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Alert terkirim' } } },
    },
    '/notifications/alert-taken': {
      post: { tags: ['Notifications'], summary: 'Notifikasi alert diambil', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Notifikasi dicatat' } } },
    },
    '/notifications/logs': {
      get: { tags: ['Notifications'], summary: 'Log notifikasi', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Log notifikasi' } } },
    },
    '/uploads/profile-photo': {
      post: { tags: ['Uploads'], summary: 'Upload profile photo', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Upload berhasil' } } },
    },
    '/uploads/report-photo': {
      post: { tags: ['Uploads'], summary: 'Upload incident photo', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Upload berhasil' } } },
    },
    '/uploads/report-completion-photo': {
      post: { tags: ['Uploads'], summary: 'Upload completion photo', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Upload berhasil' } } },
    },
  },
};

function swaggerMiddleware() {
  return swaggerUi.setup(spec, { explorer: true });
}

module.exports = { spec, swaggerMiddleware, swaggerUi };
