'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('invoices', 'packageId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'packages',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('invoices', 'voucherId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'vouchers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('invoices', 'voucherId');
    await queryInterface.removeColumn('invoices', 'packageId');
  },
};
