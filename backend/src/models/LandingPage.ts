import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface LandingPageThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  buttonRadius?: string;
  showUrgencyBar?: boolean;
  urgencyBarText?: string;
  urgencyMinutes?: number;
}

export interface LandingPagePixelConfig {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  googleTagId?: string;
}

export interface LandingPageAttributes {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  themeConfig: LandingPageThemeConfig;
  pixelConfig: LandingPagePixelConfig;
  sections: any[];
  formConfig: Record<string, any>;
  isPublished: boolean;
  viewsCount: number;
  conversionsCount: number;
  userId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LandingPageCreationAttributes
  extends Optional<LandingPageAttributes, 'id' | 'viewsCount' | 'conversionsCount' | 'userId' | 'isPublished' | 'createdAt' | 'updatedAt'> {}

class LandingPage
  extends Model<LandingPageAttributes, LandingPageCreationAttributes>
  implements LandingPageAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public description!: string;
  public category!: string;
  public themeConfig!: LandingPageThemeConfig;
  public pixelConfig!: LandingPagePixelConfig;
  public sections!: any[];
  public formConfig!: Record<string, any>;
  public isPublished!: boolean;
  public viewsCount!: number;
  public conversionsCount!: number;
  public userId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    LandingPage.hasMany(models.LandingPageSubmission, {
      foreignKey: 'landingPageId',
      as: 'submissions',
    });
    LandingPage.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

LandingPage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'psychology-test',
    },
    themeConfig: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    pixelConfig: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    sections: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    formConfig: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    viewsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    conversionsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'LandingPages',
    timestamps: true,
  }
);

export default LandingPage;

