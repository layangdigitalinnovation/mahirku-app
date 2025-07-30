'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('token_purchases', 'packageId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'packages',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('token_purchases', 'packageId');
  }
};
