'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Ambil ID role 'super_admin'
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM "roles" WHERE name = 'super_admin';`
    );

    const roleId = roles[0]?.id;

    if (!roleId) {
      throw new Error("Role 'super_admin' not found");
    }

    // Insert user dengan roleId langsung
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@neuroscan.demo',
        password: hashedPassword,
        fullname: 'Super Admin',
        address: 'Tasikmalaya, Indonesia',
        phoneNumber: '+628123456789',
        roleId: roleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'admin@neuroscan.demo' }, {});
  },
};
