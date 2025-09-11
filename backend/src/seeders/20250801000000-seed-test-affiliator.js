'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 10);



    // Insert user affiliator untuk testing
    await queryInterface.bulkInsert('users', [
      {
        username: 'aff9',
        email: 'aff9@example.com',
        password: hashedPassword,
        fullname: 'Test Affiliator 9',
        address: 'Jakarta, Indonesia',
        phoneNumber: '+628123456789',
        roleId: 2,
        bankName: 'BCA',
        bankAccountNumber: '1234567890',
        bankAccountName: 'Test Affiliator 9',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'aff9@example.com' }, {});
  },
};