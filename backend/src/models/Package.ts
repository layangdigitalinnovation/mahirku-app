// models/Package.ts
import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface PackageAttributes {
  id: number;
  name: string; // personal, family, enterprise
  description: string;
  defaultTokenAmount: number;
  price: number;
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
  },
  {
    sequelize,
    modelName: 'Package',
    tableName: 'packages',
    timestamps: true,
  }
);

export default Package;
