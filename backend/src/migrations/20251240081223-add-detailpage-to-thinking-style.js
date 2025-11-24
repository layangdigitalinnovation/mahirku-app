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
    const table = await queryInterface.describeTable('thinking_styles');
    if (!table.detailPage) {
      await queryInterface.addColumn('thinking_styles', 'detailPage', {
        type: Sequelize.TEXT, // TEXT untuk Postgres
        allowNull: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('thinking_styles', 'detailPage');
  }
};
