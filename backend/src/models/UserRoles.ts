import {
  Model,
  DataTypes
} from 'sequelize';
import { sequelize } from '../config/database';

interface UserRolesAttributes {
  userId: number;
  roleId: number;
}

class UserRoles extends Model<UserRolesAttributes> implements UserRolesAttributes {
  public userId!: number;
  public roleId!: number;
}

UserRoles.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'roles', key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'UserRoles',
    tableName: 'user_roles',
    timestamps: false,
  }
);

export default UserRoles;
