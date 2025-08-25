import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface WithdrawRequestAttributes {
  id: number;
  affiliateId: number; // referensi ke User dengan role affiliator
  amount: number; // jumlah yang diminta untuk di-withdraw
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'processing' | 'completed' | 'failed'; // status permintaan
  bankName?: string | null; // nama bank untuk transfer
  accountNumber?: string | null; // nomor rekening
  accountName?: string | null; // nama pemilik rekening
  notes?: string | null; // catatan dari admin atau affiliator
  processedAt?: Date | null; // tanggal diproses
  processedBy?: number | null; // admin yang memproses
  rejectionReason?: string | null; // alasan penolakan jika ditolak
  payoutId?: string | null; // ID payout dari Xendit
  payoutStatus?: string | null; // status payout dari Xendit
  failureReason?: string | null; // alasan gagal dari Xendit
  createdAt?: Date;
  updatedAt?: Date;
  // Relasi
  affiliate?: User;
  processor?: User;
}

interface WithdrawRequestCreationAttributes
  extends Optional<WithdrawRequestAttributes, 'id' | 'status' | 'bankName' | 'accountNumber' | 'accountName' | 'notes' | 'processedAt' | 'processedBy' | 'rejectionReason' | 'payoutId' | 'payoutStatus' | 'failureReason' | 'createdAt' | 'updatedAt'> {}

class WithdrawRequest
  extends Model<WithdrawRequestAttributes, WithdrawRequestCreationAttributes>
  implements WithdrawRequestAttributes {
  public id!: number;
  public affiliateId!: number;
  public amount!: number;
  public status!: 'pending' | 'approved' | 'rejected' | 'processed' | 'processing' | 'completed' | 'failed';
  public bankName?: string | null;
  public accountNumber?: string | null;
  public accountName?: string | null;
  public notes?: string | null;
  public processedAt?: Date | null;
  public processedBy?: number | null;
  public rejectionReason?: string | null;
  public payoutId?: string | null;
  public payoutStatus?: string | null;
  public failureReason?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Relasi
  public affiliate?: User;
  public processor?: User;

  // Method untuk approve withdraw request
  public async approve(adminId: number, notes?: string): Promise<void> {
    this.status = 'approved';
    this.processedAt = new Date();
    this.processedBy = adminId;
    if (notes) this.notes = notes;
    await this.save();
  }

  // Method untuk reject withdraw request
  public async reject(adminId: number, reason: string): Promise<void> {
    this.status = 'rejected';
    this.processedAt = new Date();
    this.processedBy = adminId;
    this.rejectionReason = reason;
    await this.save();
  }

  // Method untuk mark as processed (setelah transfer dilakukan)
  public async markAsProcessed(adminId: number, notes?: string): Promise<void> {
    this.status = 'processed';
    this.processedAt = new Date();
    this.processedBy = adminId;
    if (notes) this.notes = notes;
    await this.save();
  }
}

WithdrawRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    affiliateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Minimal withdraw 1 rupiah
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'processed', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payoutId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payoutStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'withdraw_requests',
    modelName: 'WithdrawRequest',
    timestamps: true,
  }
);

// Relasi
WithdrawRequest.belongsTo(User, { foreignKey: 'affiliateId', as: 'affiliate' });
WithdrawRequest.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });
User.hasMany(WithdrawRequest, { foreignKey: 'affiliateId', as: 'withdrawRequests' });

export default WithdrawRequest;