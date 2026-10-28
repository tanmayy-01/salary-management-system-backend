'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
    const hashedEmployeePassword = await bcrypt.hash('Employee@123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: 101,
        name: 'Super Admin',
        email: 'admin@company.com',
        password: hashedAdminPassword,
        role_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 102,
        name: 'John Doe',
        email: 'john.doe@company.com',
        password: hashedEmployeePassword,
        role_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    await queryInterface.bulkInsert('Employees', [
      {
        id: 1,
        user_id: 102,
        mobile: '9876543210',
        address: '123 Business Street, Tech District',
        base_salary: 50000.00,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Employees', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
