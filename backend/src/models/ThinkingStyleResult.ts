import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import ThinkingStyle from './ThinkingStyle';

interface ThinkingStyleResultAttributes {
  id: number;
  userId: number;
  fullname: string;
  birthdate: Date;
  resultDigit: number;
  thinkingStyleId : number;
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
  public thinkingStyleId!: number;
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
    thinkingStyleId: {
      type: DataTypes.INTEGER,
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
    tableName: "thinking_style_results",
    modelName: "ThinkingStyleResult",
    timestamps: true,
  }
);

ThinkingStyleResult.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ThinkingStyleResult, { foreignKey: 'userId' });
ThinkingStyleResult.belongsTo(ThinkingStyle, { foreignKey: 'thinkingStyleId', as : 'thinkingStyle' });
ThinkingStyle.hasMany(ThinkingStyleResult, { foreignKey: 'thinkingStyleId' , as : 'thinkingStyle' });

export default ThinkingStyleResult;
