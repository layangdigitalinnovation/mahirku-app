module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add Google OAuth fields to users table
        await queryInterface.addColumn('users', 'googleId', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
        });

        await queryInterface.addColumn('users', 'googleEmail', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        // Make password optional for Google users
        await queryInterface.changeColumn('users', 'password', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Rollback: remove Google fields
        await queryInterface.removeColumn('users', 'googleId');
        await queryInterface.removeColumn('users', 'googleEmail');

        // Make password required again
        await queryInterface.changeColumn('users', 'password', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    }
};
