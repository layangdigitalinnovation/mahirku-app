import AffiliateCommission from '../models/AffiliateCommission';
import AffiliateBalance from '../models/AffiliateBalance';
import User from '../models/User';
import TokenPurchase from '../models/TokenPurchase';

// Konfigurasi persentase komisi
const COMMISSION_CONFIG = {
  TOKEN_PURCHASE_PERCENTAGE: 10, // 10% dari total amount token purchase
  TEST_COMPLETION_AMOUNT: 10000, // Fixed amount untuk test completion
};

/**
 * Menghitung komisi dari token purchase
 * @param totalAmount - Total amount dari token purchase
 * @returns Jumlah komisi yang akan diberikan
 */
export const calculateTokenPurchaseCommission = (totalAmount: number): number => {
  return Math.floor((totalAmount * COMMISSION_CONFIG.TOKEN_PURCHASE_PERCENTAGE) / 100);
};

/**
 * Menambahkan komisi dari token purchase
 * @param tokenPurchaseId - ID dari token purchase
 * @param referrerId - ID affiliator yang mendapat komisi
 * @param userId - ID user yang melakukan purchase
 * @param totalAmount - Total amount dari token purchase
 */
export const addTokenPurchaseCommission = async (
  tokenPurchaseId: number,
  referrerId: number,
  userId: number,
  totalAmount: number
): Promise<AffiliateCommission | null> => {
  try {
    // Hitung komisi
    const commissionAmount = calculateTokenPurchaseCommission(totalAmount);
    
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
 * Menambahkan komisi dari test completion
 * @param referrerId - ID affiliator yang mendapat komisi
 * @param userId - ID user yang menyelesaikan test
 * @param testId - ID dari test (opsional)
 */
export const addTestCompletionCommission = async (
  referrerId: number,
  userId: number,
  testId?: number
): Promise<AffiliateCommission> => {
  try {
    // Buat record komisi
    const commission = await AffiliateCommission.create({
      referrerId,
      referredUserId: userId,
      testCompleted: true,
      amount: COMMISSION_CONFIG.TEST_COMPLETION_AMOUNT,
      status: 'pending',
      source: 'test_completion',
      sourceId: testId || null,
    });

    // Update atau buat affiliate balance
    await updateAffiliateBalance(referrerId, COMMISSION_CONFIG.TEST_COMPLETION_AMOUNT);

    return commission;
  } catch (error) {
    console.error('Error adding test completion commission:', error);
    throw error;
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