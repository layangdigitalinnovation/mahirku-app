'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'mitra';`
    );

    if (roles[0].length === 0) {
      await queryInterface.bulkInsert('roles', [
        {
          name: 'mitra',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', { name: 'mitra' }, {});
  },
};
