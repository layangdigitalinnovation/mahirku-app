'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('invoices');
    if (!table.referralCode) {
      await queryInterface.addColumn('invoices', 'referralCode', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'voucherCode'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('invoices', 'referralCode');
  }
};
