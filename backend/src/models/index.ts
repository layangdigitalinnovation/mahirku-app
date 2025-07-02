import User from './User';
import Role from './Role';

const models = {
  User,
  Role,
};

// Registrasi association
User.associate(models);
Role.associate(models);

export { sequelize } from '../config/database';
export default models;
