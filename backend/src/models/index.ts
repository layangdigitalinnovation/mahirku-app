import User from './User';
import Role from './Role';
import Voucher from './Voucher';
import Invoice from './Invoice';
import Package from './Package';

const models = {
  User,
  Role,
  Voucher,
  Invoice,
  Package,
};

// Registrasi association
User.associate(models);
Role.associate(models);

export { sequelize } from '../config/database';
export default models;
