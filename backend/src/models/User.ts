import {
  Model,
  DataTypes,
  Optional
} from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  roleId: number;
  fullname: string;
  address: string;
  phoneNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public roleId!: number;
  public fullname!: string;
  public address!: string;
  public phoneNumber!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 🔐 Compare password
  async comparePassword(inputPassword: string): Promise<boolean> {
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
      allowNull: false,
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
        if (user.password && !user.password.startsWith('$2a$')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password') && !user.password.startsWith('$2a$')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
