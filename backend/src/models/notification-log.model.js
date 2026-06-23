const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationLog = sequelize.define(
  'NotificationLog',
  {
    notificationLogId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'notification_log_id',
    },
    reportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'report_id',
    },
    targetDepartmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'target_department_id',
    },
    notificationType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'notification_type',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    successCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'success_count',
    },
    failureCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'failure_count',
    },
    payloadJson: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'payload_json',
    },
  },
  {
    tableName: 'notification_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

module.exports = NotificationLog;
