const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define(
  'Report',
  {
    reportId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'report_id',
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id',
    },
    reporterUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reporter_user_id',
    },
    sourceDepartmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'source_department_id',
    },
    clientSubmissionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'client_submission_id',
    },
    assignedStaffId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_staff_id',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    incidentLocationText: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'incident_location_text',
    },
    incidentLatitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: 'incident_latitude',
    },
    incidentLongitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
      field: 'incident_longitude',
    },
    status: {
      type: DataTypes.ENUM('open', 'progress', 'close'),
      allowNull: false,
      defaultValue: 'open',
    },
    progressStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'progress_started_at',
    },
    arrivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'arrived_at',
    },
    arrivedLocationText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'arrived_location_text',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at',
    },
    completedLocationText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'completed_location_text',
    },
    resolutionMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'resolution_minutes',
    },
    completionDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'completion_description',
    },
    ratingScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'rating_score',
    },
    ratingComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rating_comment',
    },
    ratedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'rated_at',
    },
    requesterRatingScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'requester_rating_score',
    },
    requesterRatingComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'requester_rating_comment',
    },
    requesterRatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'requester_rated_at',
    },
    staffRatingScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'staff_rating_score',
    },
    staffRatingComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'staff_rating_comment',
    },
    staffRatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'staff_rated_at',
    },
  },
  {
    tableName: 'reports',
    underscored: true,
  },
);

module.exports = Report;
