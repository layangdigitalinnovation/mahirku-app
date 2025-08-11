import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface AffiliateCommissionAttributes {
  id: number;
  referrerId: number; // affiliator
  referredUserId: number; // user yang daftar/tes
  testCompleted: boolean;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AffiliateCommissionCreationAttributes
  extends Optional<AffiliateCommissionAttributes, 'id' | 'testCompleted' | 'createdAt' | 'updatedAt'> {}

class AffiliateCommission
  extends Model<AffiliateCommissionAttributes, AffiliateCommissionCreationAttributes>
  implements AffiliateCommissionAttributes {
  public id!: number;
  public referrerId!: number;
  public referredUserId!: number;
  public testCompleted!: boolean;
  public amount!: number;
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
