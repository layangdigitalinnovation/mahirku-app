'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('affiliate_commissions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      referrerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      referredUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      testCompleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('affiliate_commissions');
  },
};
