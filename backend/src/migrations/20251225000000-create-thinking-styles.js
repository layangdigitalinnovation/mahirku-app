'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('thinking_styles', {
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

    // Menambahkan index untuk performa
    await queryInterface.addIndex('thinking_styles', ['digit'], {
      unique: true,
      name: 'thinking_styles_digit_unique'
    });

    await queryInterface.addIndex('thinking_styles', ['isActive'], {
      name: 'thinking_styles_is_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    // Menghapus index terlebih dahulu
    await queryInterface.removeIndex('thinking_styles', 'thinking_styles_digit_unique');
    await queryInterface.removeIndex('thinking_styles', 'thinking_styles_is_active_index');
    
    // Menghapus tabel
    await queryInterface.dropTable('thinking_styles');
  }
};