import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface LandingPageSubmissionAttributes {
  id: number;
  landingPageId: number;
  fullName: string;
  whatsapp: string;
  email: string;
  additionalData: Record<string, any>;
  packageId?: number | null;
  amount: number;
  invoiceId?: number | null;
  paymentMethod: 'gateway' | 'whatsapp';
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  referralCode?: string | null;
  userId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LandingPageSubmissionCreationAttributes
  extends Optional<LandingPageSubmissionAttributes, 'id' | 'packageId' | 'invoiceId' | 'referralCode' | 'userId' | 'status' | 'createdAt' | 'updatedAt'> {}

class LandingPageSubmission
  extends Model<LandingPageSubmissionAttributes, LandingPageSubmissionCreationAttributes>
  implements LandingPageSubmissionAttributes {
  public id!: number;
  public landingPageId!: number;
  public fullName!: string;
  public whatsapp!: string;
  public email!: string;
  public additionalData!: Record<string, any>;
  public packageId!: number | null;
  public amount!: number;
  public invoiceId!: number | null;
  public paymentMethod!: 'gateway' | 'whatsapp';
  public status!: 'pending' | 'paid' | 'completed' | 'cancelled';
  public referralCode!: string | null;
  public userId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    LandingPageSubmission.belongsTo(models.LandingPage, {
      foreignKey: 'landingPageId',
      as: 'landingPage',
    });
    LandingPageSubmission.belongsTo(models.Package, {
      foreignKey: 'packageId',
      as: 'package',
    });
    LandingPageSubmission.belongsTo(models.Invoice, {
      foreignKey: 'invoiceId',
      as: 'invoice',
    });
    LandingPageSubmission.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

LandingPageSubmission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    landingPageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    additionalData: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'gateway',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'LandingPageSubmissions',
    timestamps: true,
  }
);

export default LandingPageSubmission;

