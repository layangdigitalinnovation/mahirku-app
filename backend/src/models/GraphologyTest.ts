import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface GraphologyTestAttributes {
    id: string;
    userId: number;
    imageUrl: string;
    extractedText?: string | null;
    aiResult?: any | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    tokensUsed: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface GraphologyTestCreationAttributes
    extends Optional<GraphologyTestAttributes, 'id' | 'extractedText' | 'aiResult' | 'status' | 'tokensUsed' | 'createdAt' | 'updatedAt'> { }

class GraphologyTest extends Model<
    GraphologyTestAttributes,
    GraphologyTestCreationAttributes
> implements GraphologyTestAttributes {
    public id!: string;
    public userId!: number;
    public imageUrl!: string;
    public extractedText!: string | null;
    public aiResult!: any | null;
    public status!: 'pending' | 'processing' | 'completed' | 'failed';
    public tokensUsed!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

GraphologyTest.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        extractedText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        aiResult: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
            allowNull: false,
            defaultValue: 'pending',
        },
        tokensUsed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: "graphology_tests",
        modelName: "GraphologyTest",
        timestamps: true,
    }
);

GraphologyTest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(GraphologyTest, { foreignKey: 'userId', as: 'graphologyTests' });

export default GraphologyTest;
