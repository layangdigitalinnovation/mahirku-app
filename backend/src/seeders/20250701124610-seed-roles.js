'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('roles', [
      {
        name: 'super_admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'affiliator',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
