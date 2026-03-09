'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("graphology_tests", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            imageUrl: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            extractedText: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            aiResult: {
                type: Sequelize.JSONB,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
                allowNull: false,
                defaultValue: 'pending',
            },
            tokensUsed: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("graphology_tests");
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_graphology_tests_status";');
    }
};
