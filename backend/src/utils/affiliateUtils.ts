import AffiliateCommission from '../models/AffiliateCommission';
import AffiliateBalance from '../models/AffiliateBalance';
import User from '../models/User';
import Package from '../models/Package';

// Konfigurasi default
const COMMISSION_CONFIG = {
  DEFAULT_COMMISSION_RATE: 0, // Default rate jika package tidak ditemukan (0% = tidak ada komisi)
};

/**
 * Menambahkan komisi dari token purchase dengan dynamic commission rate
 * @param tokenPurchaseId - ID dari token purchase
 * @param referrerId - ID affiliator yang mendapat komisi
 * @param userId - ID user yang melakukan purchase
 * @param totalAmount - Total amount dari token purchase
 * @param packageId - ID package untuk menentukan commission rate
 */
export const addTokenPurchaseCommission = async (
  tokenPurchaseId: number,
  referrerId: number,
  userId: number,
  commissionAmount: number,
  packageId: number
): Promise<AffiliateCommission | null> => {
  try {
    if (commissionAmount <= 0) {
      return null;
    }

    // Buat record komisi
    const commission = await AffiliateCommission.create({
      referrerId,
      referredUserId: userId,
      testCompleted: false, // Tidak relevan untuk token purchase
      amount: commissionAmount,
      status: 'pending',
      source: 'token_purchase',
      sourceId: tokenPurchaseId,
    });

    // Update atau buat affiliate balance
    await updateAffiliateBalance(referrerId, commissionAmount);

    return commission;
  } catch (error) {
    console.error('Error adding token purchase commission:', error);
    throw error;
  }
};

/**
 * Menghitung komisi berdasarkan total tokens yang dibeli
 * @param packageId - ID package
 * @param totalTokens - Total tokens yang dibeli
 * @returns Jumlah komisi yang akan diberikan
 */
export const calculateTokenCommission = async (packageId: number, totalTokens: number): Promise<number> => {
  try {
    const packageData = await Package.findByPk(packageId);
    if (!packageData) {
      console.warn(`Package with ID ${packageId} not found, no commission will be calculated`);
      return 0;
    }
    
    // Rumus: price_per_token = package.price / package.defaultTokenAmount
    const pricePerToken = packageData.price / packageData.defaultTokenAmount;
    
    // Rumus: commission = total_tokens × price_per_token × commission_rate
    const commissionAmount = totalTokens * pricePerToken * (packageData.commissionRate / 100);
    
    return Math.floor(commissionAmount);
  } catch (error) {
    console.error('Error calculating token commission:', error);
    return 0;
  }
};

/**
 * Update atau buat affiliate balance
 * @param affiliateId - ID affiliator
 * @param commissionAmount - Jumlah komisi yang ditambahkan
 */
export const updateAffiliateBalance = async (
  affiliateId: number,
  commissionAmount: number
): Promise<AffiliateBalance> => {
  try {
    // Cari atau buat affiliate balance
    let balance = await AffiliateBalance.findOne({
      where: { affiliateId }
    });

    if (!balance) {
      // Buat balance baru jika belum ada
      balance = await AffiliateBalance.create({
        affiliateId,
        totalEarned: commissionAmount,
        availableBalance: 0, // Akan dihitung otomatis di hook
        withdrawnAmount: 0,
        minimumBalance: 100000,
      });
    } else {
      // Update balance yang sudah ada
      await balance.addCommission(commissionAmount);
    }

    return balance;
  } catch (error) {
    console.error('Error updating affiliate balance:', error);
    throw error;
  }
};

/**
 * Mendapatkan saldo yang bisa di-withdraw oleh affiliator
 * @param affiliateId - ID affiliator
 * @returns Informasi saldo affiliator
 */
export const getAffiliateBalance = async (affiliateId: number) => {
  try {
    let balance = await AffiliateBalance.findOne({
      where: { affiliateId },
      include: [
        {
          model: User,
          as: 'affiliate',
          attributes: ['id', 'fullname', 'email']
        }
      ]
    });

    if (!balance) {
      // Buat balance baru jika belum ada
      balance = await AffiliateBalance.create({
        affiliateId,
        totalEarned: 0,
        availableBalance: 0,
        withdrawnAmount: 0,
        minimumBalance: 100000,
      });
    }

    return {
      totalEarned: balance.totalEarned,
      availableBalance: balance.availableBalance,
      withdrawnAmount: balance.withdrawnAmount,
      minimumBalance: balance.minimumBalance,
      canWithdraw: balance.availableBalance > 0,
    };
  } catch (error) {
    console.error('Error getting affiliate balance:', error);
    throw error;
  }
};

/**
 * Validasi apakah user adalah affiliator
 * @param userId - ID user
 * @returns Boolean apakah user adalah affiliator
 */
export const isAffiliate = async (userId: number): Promise<boolean> => {
  try {
    const user = await User.findByPk(userId, {
      include: ['role']
    });
    
    return user?.role?.name === 'affiliator';
  } catch (error) {
    console.error('Error checking if user is affiliate:', error);
    return false;
  }
};

export { COMMISSION_CONFIG };