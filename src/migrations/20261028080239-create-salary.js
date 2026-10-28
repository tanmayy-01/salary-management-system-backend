'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Salaries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total_working_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_leave_taken: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      overtime: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_salary_made: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('Salaries', ['employee_id', 'month', 'year'], {
      unique: true,
      name: 'unique_employee_salary_per_billing_cycle'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Salaries');
  }
};