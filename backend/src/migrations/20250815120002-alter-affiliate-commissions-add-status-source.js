'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Menambahkan kolom status
    await queryInterface.addColumn('affiliate_commissions', 'status', {
      type: Sequelize.ENUM('pending', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    });

    // Menambahkan kolom source
    await queryInterface.addColumn('affiliate_commissions', 'source', {
      type: Sequelize.ENUM('test_completion', 'token_purchase'),
      allowNull: false,
      defaultValue: 'test_completion', // Set default untuk data yang sudah ada
    });

    // Menambahkan kolom sourceId
    await queryInterface.addColumn('affiliate_commissions', 'sourceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Menambahkan index untuk performa
    await queryInterface.addIndex('affiliate_commissions', ['status']);
    await queryInterface.addIndex('affiliate_commissions', ['source']);
  },

  async down(queryInterface, Sequelize) {
    // Menghapus index terlebih dahulu
    await queryInterface.removeIndex('affiliate_commissions', ['status']);
    await queryInterface.removeIndex('affiliate_commissions', ['source']);
    
    // Menghapus kolom
    await queryInterface.removeColumn('affiliate_commissions', 'sourceId');
    await queryInterface.removeColumn('affiliate_commissions', 'source');
    await queryInterface.removeColumn('affiliate_commissions', 'status');
  },
};