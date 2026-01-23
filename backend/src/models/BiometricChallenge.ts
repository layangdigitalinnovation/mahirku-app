import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BiometricChallengeAttributes {
  id: number;
  userId: number;
  challenge: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BiometricChallengeCreationAttributes extends Optional<BiometricChallengeAttributes, 'id'> { }

class BiometricChallenge extends Model<BiometricChallengeAttributes, BiometricChallengeCreationAttributes> implements BiometricChallengeAttributes {
  public id!: number;
  public userId!: number;
  public challenge!: string;
  public expiresAt!: Date;
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
  },
  {
    sequelize,
    tableName: 'biometric_challenges',
  }
);

export default BiometricChallenge;
