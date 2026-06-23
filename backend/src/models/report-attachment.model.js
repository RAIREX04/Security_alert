const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReportAttachment = sequelize.define(
  'ReportAttachment',
  {
    attachmentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'attachment_id',
    },
    reportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'report_id',
    },
    attachmentType: {
      type: DataTypes.ENUM('incident_photo', 'completion_photo'),
      allowNull: false,
      field: 'attachment_type',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_url',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'mime_type',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'file_size',
    },
  },
  {
    tableName: 'report_attachments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

module.exports = ReportAttachment;
