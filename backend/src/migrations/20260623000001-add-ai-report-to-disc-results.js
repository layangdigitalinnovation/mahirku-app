'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('disc_results', 'ai_report_status', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'pending',
    });
    
    await queryInterface.addColumn('disc_results', 'ai_report', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn('disc_results', 'ai_report_error', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('disc_results', 'ai_report_generated_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('disc_results', 'ai_report_status');
    await queryInterface.removeColumn('disc_results', 'ai_report');
    await queryInterface.removeColumn('disc_results', 'ai_report_error');
    await queryInterface.removeColumn('disc_results', 'ai_report_generated_at');
  }
};
