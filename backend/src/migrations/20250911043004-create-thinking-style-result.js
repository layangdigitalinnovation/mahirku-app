'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.createTable("thinking_style_results", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // pastikan sesuai nama tabel user
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      resultDigit: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      thinkingStyleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "thinking_styles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fingerprintId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      referrerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users", // kalau referral user juga dari tabel users
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("thinking_style_results");
  }
};
