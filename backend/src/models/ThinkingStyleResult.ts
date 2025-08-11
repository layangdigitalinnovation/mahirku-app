import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface ThinkingStyleResultAttributes {
  id: number;
  userId: number;
  fullname: string;
  birthdate: Date;
  resultDigit: number;
  resultType: string;
  resultCode: string;
  description: string;
  theory: string;
  fingerprintId?: string | null;
  referrerId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ThinkingStyleResultCreationAttributes
  extends Optional<ThinkingStyleResultAttributes, 'id' | 'fingerprintId' | 'referrerId' | 'createdAt' | 'updatedAt'> {}

class ThinkingStyleResult extends Model<
  ThinkingStyleResultAttributes,
  ThinkingStyleResultCreationAttributes
> implements ThinkingStyleResultAttributes {
  public id!: number;
  public userId!: number;
  public fullname!: string;
  public birthdate!: Date;
  public resultDigit!: number;
  public resultType!: string;
  public resultCode!: string;
  public description!: string;
  public theory!: string;
  public fingerprintId!: string | null;
  public referrerId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ThinkingStyleResult.init(
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
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    resultDigit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resultType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resultCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    theory: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fingerprintId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referrerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'thinking_style_results',
    modelName: 'ThinkingStyleResult',
    timestamps: true,
  }
);

ThinkingStyleResult.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ThinkingStyleResult, { foreignKey: 'userId' });

export default ThinkingStyleResult;
