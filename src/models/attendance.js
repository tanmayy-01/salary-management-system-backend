'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // many-to-one: Many daily attendance entries belong back to a single Employee
      Attendance.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      })
    }
  }
  Attendance.init({
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD
      allowNull: false
    },
    working_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00,
        max: 24.00
      }
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00,
        max: 24.00
      }
    }
  }, {
    sequelize,
    modelName: 'Attendance',
    tableName: 'Attendances',
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'date']
      }
    ]
  });
  return Attendance;
};