'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('affiliate_balances', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      affiliateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      totalEarned: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      availableBalance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      withdrawnAmount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      minimumBalance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100000,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Menambahkan index untuk performa
    await queryInterface.addIndex('affiliate_balances', ['affiliateId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('affiliate_balances');
  },
};