import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface AffiliateCommissionAttributes {
  id: number;
  referrerId: number; // affiliator
  referredUserId: number; // user yang daftar/tes
  testCompleted: boolean;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled'; // status komisi
  source: 'test_completion' | 'token_purchase'; // sumber komisi
  sourceId?: number | null; // ID dari sumber (test ID atau token purchase ID)
  createdAt?: Date;
  updatedAt?: Date;
}

interface AffiliateCommissionCreationAttributes
  extends Optional<AffiliateCommissionAttributes, 'id' | 'testCompleted' | 'status' | 'sourceId' | 'createdAt' | 'updatedAt'> {}

class AffiliateCommission
  extends Model<AffiliateCommissionAttributes, AffiliateCommissionCreationAttributes>
  implements AffiliateCommissionAttributes {
  public id!: number;
  public referrerId!: number;
  public referredUserId!: number;
  public testCompleted!: boolean;
  public amount!: number;
  public status!: 'pending' | 'paid' | 'cancelled';
  public source!: 'test_completion' | 'token_purchase';
  public sourceId?: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AffiliateCommission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    referrerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    referredUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    testCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    source: {
      type: DataTypes.ENUM('test_completion', 'token_purchase'),
      allowNull: false,
    },
    sourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'affiliate_commissions',
    modelName: 'AffiliateCommission',
    timestamps: true,
  }
);

AffiliateCommission.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
AffiliateCommission.belongsTo(User, { foreignKey: 'referredUserId', as: 'referredUser' });

export default AffiliateCommission;
