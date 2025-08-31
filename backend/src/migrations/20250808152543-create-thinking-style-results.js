'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('thinking_style_results', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
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
      resultType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      resultCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      theory: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fingerprintId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      referrerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('thinking_style_results');
  },
};
