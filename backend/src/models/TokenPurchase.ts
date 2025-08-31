import {
  Model,
  DataTypes,
  Optional
} from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Voucher from './Voucher';
import Package from './Package';

// Interface atribut
interface TokenPurchaseAttributes {
  id: number;
  userId: number;
  voucherId?: number | null;
  packageId?: number | null;
  totalToken: number;
  pricePerToken: number;
  totalAmount: number;
  discountAmount?: number | null;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string | null;
  paymentGatewayResponse?: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface input (untuk create)
interface TokenPurchaseCreationAttributes
  extends Optional<TokenPurchaseAttributes, 'id' | 'voucherId' | 'packageId' | 'discountAmount' | 'paymentMethod' | 'paymentGatewayResponse' | 'paymentStatus' | 'createdAt' | 'updatedAt'> {}

// Define model
class TokenPurchase
  extends Model<TokenPurchaseAttributes, TokenPurchaseCreationAttributes>
  implements TokenPurchaseAttributes {
  public id!: number;
  public userId!: number;
  public voucherId!: number | null;
  public packageId?: number | null;
  public totalToken!: number;
  public pricePerToken!: number;
  public totalAmount!: number;
  public discountAmount?: number | null;
  public paymentStatus!: 'pending' | 'paid' | 'failed';
  public paymentMethod!: string | null;
  public paymentGatewayResponse!: object | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Init model
TokenPurchase.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  voucherId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  totalToken: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pricePerToken: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentGatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'token_purchases',
  modelName: 'TokenPurchase',
  timestamps: true
});

// Relasi
TokenPurchase.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(TokenPurchase, { foreignKey: 'userId' });

TokenPurchase.belongsTo(Voucher, { foreignKey: 'voucherId' });

TokenPurchase.belongsTo(Package, { foreignKey: 'packageId' });
Package.hasMany(TokenPurchase, { foreignKey: 'packageId' });

export default TokenPurchase;
