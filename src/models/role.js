'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // one-to-many: One role can belong to many users
      Role.hasMany(models.User,{
        foreignKey: "role_id",
        as: "users"
      })
    }
  }
  Role.init({
    role_name: {
      type: DataTypes.ENUM('admin','employee'),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'Roles',
  });
  return Role;
};