const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define(
  'Department',
  {
    departmentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'department_id',
    },
    departmentCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'department_code',
    },
    departmentName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'department_name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'departments',
    underscored: true,
    timestamps: false,
  },
);

module.exports = Department;
