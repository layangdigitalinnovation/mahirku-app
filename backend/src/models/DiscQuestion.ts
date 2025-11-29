import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface DiscQuestionAttributes {
    id: number;
    question_order: number;
    created_at?: Date;
    updated_at?: Date;
}

interface DiscQuestionCreationAttributes extends Optional<DiscQuestionAttributes, 'id'> { }

class DiscQuestion extends Model<DiscQuestionAttributes, DiscQuestionCreationAttributes> implements DiscQuestionAttributes {
    public id!: number;
    public question_order!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    static associate(models: any) {
        DiscQuestion.hasMany(models.DiscOption, {
            foreignKey: 'question_id',
            as: 'options',
        });
    }
}

DiscQuestion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        question_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'disc_questions',
        underscored: true,
    }
);

export default DiscQuestion;
