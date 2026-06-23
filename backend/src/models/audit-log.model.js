const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    auditLogId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'audit_log_id',
    },
    actorUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'actor_user_id',
    },
    entityType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'entity_type',
    },
    entityId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'entity_id',
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    beforeJson: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'before_json',
    },
    afterJson: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'after_json',
    },
  },
  {
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

module.exports = AuditLog;
