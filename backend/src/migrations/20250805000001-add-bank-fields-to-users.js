'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambah field bank untuk affiliator
    await queryInterface.addColumn('users', 'bankName', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'bankAccountNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'bankAccountName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Hapus field yang ditambahkan
    await queryInterface.removeColumn('users', 'bankName');
    await queryInterface.removeColumn('users', 'bankAccountNumber');
    await queryInterface.removeColumn('users', 'bankAccountName');
  }
};