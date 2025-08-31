import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Interface atribut Voucher
interface VoucherAttributes {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Opsional untuk `id` karena auto increment
interface VoucherCreationAttributes extends Optional<VoucherAttributes, 'id'> {}

// Model class
class Voucher extends Model<VoucherAttributes, VoucherCreationAttributes>
  implements VoucherAttributes {
  public id!: number;
  public code!: string;
  public type!: 'percentage' | 'fixed';
  public value!: number;
  public isActive!: boolean;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Voucher.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Voucher',
    tableName: 'vouchers',
  }
);

export default Voucher;
