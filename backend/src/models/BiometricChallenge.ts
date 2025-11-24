import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface BiometricChallengeAttributes {
  id: number;
  userId: number;
  challenge: string;
  expiresAt: Date;
  used: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BiometricChallengeCreationAttributes extends Optional<BiometricChallengeAttributes, 'id' | 'used'> {}

class BiometricChallenge
  extends Model<BiometricChallengeAttributes, BiometricChallengeCreationAttributes>
  implements BiometricChallengeAttributes {
  public id!: number;
  public userId!: number;
  public challenge!: string;
  public expiresAt!: Date;
  public used!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BiometricChallenge.init(
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
    challenge: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'BiometricChallenge',
    tableName: 'biometric_challenges',
    timestamps: true,
  }
);

BiometricChallenge.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(BiometricChallenge, { foreignKey: 'userId' });

export default BiometricChallenge;
