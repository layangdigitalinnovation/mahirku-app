import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DiscOptionAttributes {
    id: number;
    question_id: number;
    text: string;
    value: 'D' | 'I' | 'S' | 'C';
    created_at?: Date;
    updated_at?: Date;
}

interface DiscOptionCreationAttributes extends Optional<DiscOptionAttributes, 'id'> { }

class DiscOption extends Model<DiscOptionAttributes, DiscOptionCreationAttributes> implements DiscOptionAttributes {
    public id!: number;
    public question_id!: number;
    public text!: string;
    public value!: 'D' | 'I' | 'S' | 'C';
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    static associate(models: any) {
        DiscOption.belongsTo(models.DiscQuestion, {
            foreignKey: 'question_id',
            as: 'question',
        });
    }
}

DiscOption.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.ENUM('D', 'I', 'S', 'C'),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'disc_options',
        underscored: true,
    }
);

export default DiscOption;
