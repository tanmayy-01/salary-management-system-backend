'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       // Many-to-One: Many monthly salary records point back to a single Employee profile
      Salary.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });
    }
  }
  Salary.init({
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,  // January
        max: 12  // December
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000 // Simple validation safeguard against invalid past years
      }
    },
    total_working_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_leave_taken: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    overtime: {
      type: DataTypes.DECIMAL(10, 2), // Total calculated overtime earnings payout
      allowNull: false,
      defaultValue: 0.00
    },
    total_salary_made: {
      type: DataTypes.DECIMAL(10, 2), // Final calculated net pay for the month
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00
      }
    }
  }, {
    sequelize,
    modelName: 'Salary',
    tableName: 'Salaries',
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'month', 'year']
      }
    ]
  });
  return Salary;
};