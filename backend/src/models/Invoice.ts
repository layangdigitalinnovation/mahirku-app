import {
  Model,
  DataTypes,
  Optional,
} from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import Package from './Package';
import Voucher from './Voucher';

interface InvoiceAttributes {
  id: number;
  userId: number;
  tokenAmount: number;
  packageId?: number | null;
  voucherId?: number | null;
  voucherCode?: string | null;
  status: 'PENDING' | 'PAID' | 'FAILED';
  paymentDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InvoiceCreationAttributes
  extends Optional<InvoiceAttributes, 'id' | 'voucherId' | 'packageId' | 'voucherCode' | 'status' | 'paymentDate' | 'createdAt' | 'updatedAt'> {}

class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes {
  public id!: number;
  public userId!: number;
  public tokenAmount!: number;
  public packageId!: number | null;
  public voucherId!: number | null;
  public voucherCode!: string | null;
  public status!: 'PENDING' | 'PAID' | 'FAILED';
  public paymentDate!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Invoice.init(
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
    tokenAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    voucherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    voucherCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'invoices',
    modelName: 'Invoice',
    timestamps: true,
  }
);

// Relasi
Invoice.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Invoice, { foreignKey: 'userId' });

Invoice.belongsTo(Package, { foreignKey: 'packageId' });
Invoice.belongsTo(Voucher, { foreignKey: 'voucherId' });

export default Invoice;
