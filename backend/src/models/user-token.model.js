const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserToken = sequelize.define(
  'UserToken',
  {
    tokenId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'token_id',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    platform: {
      type: DataTypes.ENUM('android'),
      allowNull: false,
      defaultValue: 'android',
    },
    fcmToken: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      field: 'fcm_token',
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'device_id',
    },
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_seen_at',
    },
  },
  {
    tableName: 'user_tokens',
    underscored: true,
  },
);

module.exports = UserToken;
