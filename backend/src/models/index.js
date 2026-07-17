const { QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Role = require('./role.model');
const Department = require('./department.model');
const User = require('./user.model');
const Report = require('./report.model');
const ReportAttachment = require('./report-attachment.model');
const UserToken = require('./user-token.model');
const RefreshToken = require('./refresh-token.model');
const NotificationLog = require('./notification-log.model');
const AuditLog = require('./audit-log.model');

Role.hasMany(User, { foreignKey: 'roleId' });
Department.hasMany(User, { foreignKey: 'departmentId' });
User.belongsTo(Role, { foreignKey: 'roleId' });
User.belongsTo(Department, { foreignKey: 'departmentId' });
User.belongsTo(User, { foreignKey: 'approvedByUserId', as: 'approvedByUser', onDelete: 'SET NULL' });

Department.hasMany(Report, { foreignKey: 'departmentId', as: 'targetReports' });
Department.hasMany(Report, { foreignKey: 'sourceDepartmentId', as: 'sourceReports' });
User.hasMany(Report, { foreignKey: 'reporterUserId', as: 'reportedAlerts', onDelete: 'SET NULL' });
User.hasMany(Report, { foreignKey: 'assignedStaffId', as: 'handledReports', onDelete: 'SET NULL' });
Report.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Report.belongsTo(Department, { foreignKey: 'sourceDepartmentId', as: 'sourceDepartment' });
Report.belongsTo(User, { foreignKey: 'reporterUserId', as: 'reporter', onDelete: 'SET NULL' });
Report.belongsTo(User, { foreignKey: 'assignedStaffId', as: 'assignedStaff', onDelete: 'SET NULL' });
Report.hasMany(ReportAttachment, { foreignKey: 'reportId', as: 'attachments' });
ReportAttachment.belongsTo(Report, { foreignKey: 'reportId' });

User.hasMany(UserToken, { foreignKey: 'userId', as: 'pushTokens', onDelete: 'CASCADE' });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens', onDelete: 'CASCADE' });
UserToken.belongsTo(User, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

Department.hasMany(NotificationLog, { foreignKey: 'targetDepartmentId', onDelete: 'NO ACTION' });
Report.hasMany(NotificationLog, { foreignKey: 'reportId' });
User.hasMany(AuditLog, { foreignKey: 'actorUserId', onDelete: 'SET NULL' });

async function syncDatabase() {
  const shouldSync = String(process.env.DB_SYNC_ON_START || 'true').toLowerCase() === 'true';
  if (!shouldSync) return;
  await sequelize.sync();
  await ensureReportReviewColumns();
}

async function ensureReportReviewColumns() {
  const requiredColumns = [
    ['requester_rating_score', 'INT NULL'],
    ['requester_rating_comment', 'NVARCHAR(MAX) NULL'],
    ['requester_rated_at', 'DATETIME2(0) NULL'],
    ['staff_rating_score', 'INT NULL'],
    ['staff_rating_comment', 'NVARCHAR(MAX) NULL'],
    ['staff_rated_at', 'DATETIME2(0) NULL'],
    ['client_submission_id', 'NVARCHAR(100) NULL'],
    ['arrived_location_text', 'NVARCHAR(255) NULL'],
    ['completed_location_text', 'NVARCHAR(255) NULL'],
  ];

  for (const [columnName, definition] of requiredColumns) {
    const rows = await sequelize.query(
      `
        SELECT 1 AS present
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'dbo'
          AND TABLE_NAME = 'reports'
          AND COLUMN_NAME = :columnName
      `,
      {
        replacements: { columnName },
        type: QueryTypes.SELECT,
      },
    );

    if (!rows || rows.length === 0) {
      await sequelize.query(`ALTER TABLE dbo.reports ADD ${columnName} ${definition};`);
    }
  }
}

module.exports = {
  sequelize,
  Role,
  Department,
  User,
  Report,
  ReportAttachment,
  UserToken,
  RefreshToken,
  NotificationLog,
  AuditLog,
  syncDatabase,
};
