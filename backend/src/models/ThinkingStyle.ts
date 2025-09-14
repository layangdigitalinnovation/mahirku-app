import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Interface untuk atribut ThinkingStyle
interface ThinkingStyleAttributes {
  id: number;
  digit: number;
  type: string;
  code: string;
  description: string;
  theory: string;
  isActive: boolean;
  detailPage: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface untuk pembuatan ThinkingStyle (id opsional)
interface ThinkingStyleCreationAttributes extends Optional<ThinkingStyleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Model ThinkingStyle
class ThinkingStyle extends Model<ThinkingStyleAttributes, ThinkingStyleCreationAttributes> implements ThinkingStyleAttributes {
  public id!: number;
  public digit!: number;
  public type!: string;
  public code!: string;
  public description!: string;
  public theory!: string;
  public detailPage!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method untuk mencari thinking style berdasarkan digit
  static async findByDigit(digit: number): Promise<ThinkingStyle | null> {
    return await ThinkingStyle.findOne({
      where: {
        digit,
        isActive: true
      }
    });
  }

  // Method untuk mendapatkan semua thinking styles yang aktif
  static async findAllActive(): Promise<ThinkingStyle[]> {
    return await ThinkingStyle.findAll({
      where: {
        isActive: true
      },
      order: [['digit', 'ASC']]
    });
  }
}

// Inisialisasi model
ThinkingStyle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    digit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        min: 1,
        max: 9
      },
      comment: 'Digit hasil perhitungan numerologi (1-9)'
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nama tipe gaya berpikir'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Kode singkat gaya berpikir'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Deskripsi lengkap gaya berpikir'
    },
    theory: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Landasan teori gaya berpikir'
    },
    detailPage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detail halaman gaya berpikir'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Status aktif thinking style'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ThinkingStyle',
    tableName: 'thinking_styles',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['digit']
      },
      {
        fields: ['isActive']
      }
    ]
  }
);

export default ThinkingStyle;
export { ThinkingStyleAttributes, ThinkingStyleCreationAttributes };