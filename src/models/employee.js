'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // one-to-one Inverse: Employee profile belongs back to a single User account
      Employee.hasOne(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })

      // one-to-many: An employee can submit many daily attendance check-ins
      Employee.hasMany(models.Attendance,{
        foreignKey: 'employee_id',
        as: 'attendances',
        onDelete: 'CASCADE'
      })

      // One-to-Many: An employee can make many leave requests
      Employee.hasMany(models.Leave, {
        foreignKey: 'employee_id',
        as: 'leaves',
        onDelete: 'CASCADE'
      });

      // One-to-Many: An employee can have multiple historical monthly salary payouts
      Employee.hasMany(models.Salary, {
        foreignKey: 'employee_id',
        as: 'salaries',
        onDelete: 'CASCADE'
      });
    }
  }
  Employee.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    base_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: true,
        min: 0.00
      }
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'Employees'
  });
  return Employee;
};