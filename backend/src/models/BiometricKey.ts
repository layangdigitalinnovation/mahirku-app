import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BiometricKeyAttributes {
    id: number;
    userId: number;
    publicKey: string;
    deviceId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface BiometricKeyCreationAttributes extends Optional<BiometricKeyAttributes, 'id'> { }

class BiometricKey extends Model<BiometricKeyAttributes, BiometricKeyCreationAttributes> implements BiometricKeyAttributes {
    public id!: number;
    public userId!: number;
    public publicKey!: string;
    public deviceId!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

BiometricKey.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        publicKey: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'biometric_keys',
    }
);

export default BiometricKey;
