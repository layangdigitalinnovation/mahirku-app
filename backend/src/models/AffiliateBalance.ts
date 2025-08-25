import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface AffiliateBalanceAttributes {
  id: number;
  affiliateId: number; // referensi ke User dengan role affiliator
  totalEarned: number; // total komisi yang pernah diterima
  availableBalance: number; // saldo yang bisa di-withdraw (totalEarned - withdrawnAmount - minimumBalance)
  withdrawnAmount: number; // total yang sudah di-withdraw
  minimumBalance: number; // saldo minimum yang harus mengendap (default 100.000)
  createdAt?: Date;
  updatedAt?: Date;
}

interface AffiliateBalanceCreationAttributes
  extends Optional<AffiliateBalanceAttributes, 'id' | 'totalEarned' | 'availableBalance' | 'withdrawnAmount' | 'minimumBalance' | 'createdAt' | 'updatedAt'> {}

class AffiliateBalance
  extends Model<AffiliateBalanceAttributes, AffiliateBalanceCreationAttributes>
  implements AffiliateBalanceAttributes {
  public id!: number;
  public affiliateId!: number;
  public totalEarned!: number;
  public availableBalance!: number;
  public withdrawnAmount!: number;
  public minimumBalance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method untuk menghitung saldo yang bisa di-withdraw
  public calculateAvailableBalance(): number {
    return Math.max(0, this.totalEarned - this.withdrawnAmount - this.minimumBalance);
  }

  // Method untuk menambah komisi
  public async addCommission(amount: number): Promise<void> {
    this.totalEarned += amount;
    this.availableBalance = this.calculateAvailableBalance();
    await this.save();
  }

  // Method untuk withdraw
  public async withdraw(amount: number): Promise<boolean> {
    if (amount > this.availableBalance) {
      return false; // Saldo tidak mencukupi
    }
    
    this.withdrawnAmount += amount;
    this.availableBalance = this.calculateAvailableBalance();
    await this.save();
    return true;
  }
}

AffiliateBalance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    affiliateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Satu affiliator hanya punya satu balance record
    },
    totalEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    availableBalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    withdrawnAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    minimumBalance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100000, // 100.000 rupiah
    },
  },
  {
    sequelize,
    tableName: 'affiliate_balances',
    modelName: 'AffiliateBalance',
    timestamps: true,
    hooks: {
      beforeSave: (instance: AffiliateBalance) => {
        // Selalu hitung ulang availableBalance sebelum save
        instance.availableBalance = instance.calculateAvailableBalance();
      },
    },
  }
);

// Relasi
AffiliateBalance.belongsTo(User, { foreignKey: 'affiliateId', as: 'affiliate' });
User.hasOne(AffiliateBalance, { foreignKey: 'affiliateId', as: 'affiliateBalance' });

export default AffiliateBalance;