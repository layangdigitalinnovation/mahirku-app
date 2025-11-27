import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        // Remove unused columns from thinking_style_results table
        await queryInterface.removeColumn('thinking_style_results', 'resultCode');
        await queryInterface.removeColumn('thinking_style_results', 'description');
        await queryInterface.removeColumn('thinking_style_results', 'theory');
    },

    down: async (queryInterface: QueryInterface): Promise<void> => {
        // Rollback: add back the columns (optional, bisa skip jika tidak perlu)
        await queryInterface.addColumn('thinking_style_results', 'resultCode', {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        });
        await queryInterface.addColumn('thinking_style_results', 'description', {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: ''
        });
        await queryInterface.addColumn('thinking_style_results', 'theory', {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: ''
        });
    }
};
