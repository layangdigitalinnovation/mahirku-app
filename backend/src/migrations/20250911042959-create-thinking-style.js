'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable("thinking_styles", {
     id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      digit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          min: 1,
          max: 9
        },
        comment: 'Digit hasil perhitungan numerologi (1-9)'
      },
      type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nama tipe gaya berpikir'
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Kode singkat gaya berpikir'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Deskripsi lengkap gaya berpikir'
      },
      theory: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Landasan teori gaya berpikir'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Status aktif thinking style'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable("thinking_styles");

  }
};
