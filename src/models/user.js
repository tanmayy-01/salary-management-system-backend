"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // many-to-one: Many user belongs to a single role
      User.belongsTo(models.Role, {
        foreignKey: "role_id",
        as: "role",
      });

      // one-to-one:  A user with an 'Employee' role has exactly one profile record
      User.hasOne(models.Employee, {
        foreignKey: 'user_id',
        as: 'employeeProfile',
        onDelete: 'CASCADE'
      })
    }
  }
  User.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Roles",
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
    },
  );
  return User;
};
