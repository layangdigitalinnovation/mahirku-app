// models/Package.ts
import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PackageAttributes {
  id: number;
  name: string; // personal, family, enterprise
  description: string;
  defaultTokenAmount: number;
  price: number;
  commissionRate: number; // percentage for affiliate commission (0-100)
  mitraCommissionRate: number; // percentage for mitra commission (0-100)
  createdAt?: Date;
  updatedAt?: Date;
}

interface PackageCreationAttributes extends Optional<PackageAttributes, 'id'> {}

class Package extends Model<PackageAttributes, PackageCreationAttributes> implements PackageAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public defaultTokenAmount!: number;
  public price!: number;
  public commissionRate!: number;
  public mitraCommissionRate!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Package.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    defaultTokenAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    mitraCommissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    sequelize,
    modelName: 'Package',
    tableName: 'packages',
    timestamps: true,
  }
);

export default Package;
