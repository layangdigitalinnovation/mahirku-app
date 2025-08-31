'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambah field baru untuk Xendit payout
    await queryInterface.addColumn('withdraw_requests', 'payoutId', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('withdraw_requests', 'payoutStatus', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('withdraw_requests', 'failureReason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // Update enum status untuk menambahkan status baru
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_withdraw_requests_status\" ADD VALUE 'processing';"
    );
    
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_withdraw_requests_status\" ADD VALUE 'completed';"
    );
    
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_withdraw_requests_status\" ADD VALUE 'failed';"
    );
  },

  async down(queryInterface, Sequelize) {
    // Hapus field yang ditambahkan
    await queryInterface.removeColumn('withdraw_requests', 'payoutId');
    await queryInterface.removeColumn('withdraw_requests', 'payoutStatus');
    await queryInterface.removeColumn('withdraw_requests', 'failureReason');

    // Note: Menghapus nilai dari enum PostgreSQL lebih kompleks dan tidak disarankan
    // dalam production. Untuk rollback yang aman, sebaiknya buat enum baru.
  }
};