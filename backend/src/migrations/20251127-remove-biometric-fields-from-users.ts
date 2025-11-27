import { QueryInterface } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        // Remove biometric-related columns from users table
        // These are now handled by separate biometric_keys and biometric_challenges tables
        await queryInterface.removeColumn('users', 'biometricPublicKey');
        await queryInterface.removeColumn('users', 'biometricChallenge');
        await queryInterface.removeColumn('users', 'biometricChallengeExpiresAt');
    },

    down: async (queryInterface: QueryInterface): Promise<void> => {
        // Rollback: add back the columns (optional)
        const { DataTypes } = require('sequelize');

        await queryInterface.addColumn('users', 'biometricPublicKey', {
            type: DataTypes.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'biometricChallenge', {
            type: DataTypes.TEXT,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'biometricChallengeExpiresAt', {
            type: DataTypes.DATE,
            allowNull: true
        });
    }
};
