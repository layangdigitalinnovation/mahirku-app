import {
  Model,
  DataTypes,
  Optional,
  Association,
} from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../config/database';
import Package from './Package';

interface Role {
  id: number;
  name: string;
}

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password?: string; // Optional for Google users
  roleId: number;
  fullname: string;
  address: string;
  phoneNumber: string;
  tokens: number;
  parentId?: number | null;
  packageId?: number | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  googleId?: string | null;
  googleEmail?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'tokens' | 'parentId' | 'packageId'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password?: string; // Optional for Google users
  public roleId!: number;
  public fullname!: string;
  public address!: string;
  public phoneNumber!: string;
  public tokens!: number;
  public parentId?: number | null;
  public packageId?: number | null;
  public bankName?: string | null;
  public bankAccountNumber?: string | null;
  public bankAccountName?: string | null;
  public googleId?: string | null;
  public googleEmail?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relations
  public readonly children?: User[]; // hasMany
  public readonly parent?: User;     // belongsTo
  public readonly package?: Package; // belongsTo
  public readonly role?: Role;       // belongsTo

  public static associations: {
    children: Association<User, User>;
    parent: Association<User, User>;
    package: Association<User, Package>;
    role: Association<User, any>;
  };

  // 🔐 Compare password
  async comparePassword(inputPassword: string): Promise<boolean> {
    if (!this.password) return false; // Google users don't have password
    return await bcrypt.compare(inputPassword, this.password);
  }

  // 🔐 Generate JWT token
  generateAuthToken(): string {
    const payload = {
      userId: this.id,
      roleId: this.roleId,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in .env');
    }

    return jwt.sign(payload, secret, { expiresIn: '7h' });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await User.scope('withPassword').findOne({
      where: { email },
      include: ['role'],
    });
  }

  static associate(models: any) {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role',
    });

    // 🔁 Parent-child relationship
    User.belongsTo(models.User, {
      foreignKey: 'parentId',
      as: 'parent',
    });

    User.hasMany(models.User, {
      foreignKey: 'parentId',
      as: 'children',
    });

    User.belongsTo(models.Package, {
      foreignKey: 'packageId',
      as: 'package',
    });
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for Google users
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      references: {
        model: 'Roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^\+?[0-9]+$/,
      },
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'packages',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    googleEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: { attributes: { include: ['password'] } },
    },
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password && !/^\$2[aby]\$/.test(user.password)) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.password && user.changed('password') && !/^\$2[aby]\$/.test(user.password)) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
