'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('thinking_style_results', 'questionnaire', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('thinking_style_results', 'questionnairePercent', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('thinking_style_results', 'aiReport', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('thinking_style_results', 'aiReportStatus', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending',
    });
    await queryInterface.addColumn('thinking_style_results', 'aiReportError', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('thinking_style_results', 'aiReportGeneratedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('thinking_style_results', 'aiReportGeneratedAt');
    await queryInterface.removeColumn('thinking_style_results', 'aiReportError');
    await queryInterface.removeColumn('thinking_style_results', 'aiReportStatus');
    await queryInterface.removeColumn('thinking_style_results', 'aiReport');
    await queryInterface.removeColumn('thinking_style_results', 'questionnairePercent');
    await queryInterface.removeColumn('thinking_style_results', 'questionnaire');
  },
};

