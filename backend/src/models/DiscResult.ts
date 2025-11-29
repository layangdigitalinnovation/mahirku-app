import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DiscResultAttributes {
    id: number;
    user_id: number;
    d_score: number;
    i_score: number;
    s_score: number;
    c_score: number;
    dominant_type: string | null;
    created_at?: Date;
    updated_at?: Date;
}

interface DiscResultCreationAttributes extends Optional<DiscResultAttributes, 'id'> { }

class DiscResult extends Model<DiscResultAttributes, DiscResultCreationAttributes> implements DiscResultAttributes {
    public id!: number;
    public user_id!: number;
    public d_score!: number;
    public i_score!: number;
    public s_score!: number;
    public c_score!: number;
    public dominant_type!: string | null;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    static associate(models: any) {
        DiscResult.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
    }
}

DiscResult.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        d_score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        i_score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        s_score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        c_score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        dominant_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'disc_results',
        underscored: true,
    }
);

export default DiscResult;
