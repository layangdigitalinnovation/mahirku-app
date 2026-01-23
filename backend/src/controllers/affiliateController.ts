import { Response } from 'express';
import AffiliateCommission from '../models/AffiliateCommission';
import WithdrawRequest from '../models/WithdrawRequest';
import User from '../models/User';
import ThinkingStyleResult from '../models/ThinkingStyleResult';
import DiscResult from '../models/DiscResult';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getAffiliateBalance } from '../utils/affiliateUtils';
import { sequelize } from '../config/database';

// 1. Generate referral link
export const getReferralLink = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {

     const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://mahirku.com"
        : "http://localhost:5173"; // ganti sesuai URL frontend dev kamu

           const referralCode = `aff${userId}`;
    const link = `${baseUrl}/?ref=${referralCode}`;

    res.status(200).json({ referralLink: link });
  } catch (error: any) {
    console.error('getReferralLink error:', error);
    res.status(500).json({ error: 'Gagal membuat link referral' });
  }
};

// 3. Statistik affiliator dengan balance information
export const getAffiliateStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Get balance information
    const balanceInfo = await getAffiliateBalance(userId);

    // Get commission statistics
    const totalTests = await AffiliateCommission.count({
      where: { referrerId: userId, testCompleted: true },
    });

    const totalTokenPurchaseCommissions = await AffiliateCommission.count({
      where: { referrerId: userId, source: 'token_purchase' },
    });

    // Get recent commission history
    const history = await AffiliateCommission.findAll({
      where: { referrerId: userId },
      include: [
        {
          model: User,
          as: 'referredUser',
          attributes: ['id', 'fullname', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10, // Limit to recent 10 transactions
    });

    // Get recent withdraw requests
    const recentWithdraws = await WithdrawRequest.findAll({
      where: { affiliateId: userId },
      order: [['createdAt', 'DESC']],
      limit: 5, // Recent 5 withdraw requests
    });

    res.status(200).json({
      balance: balanceInfo,
      statistics: {
        totalTests,
        totalTokenPurchaseCommissions,
        totalCommissions: balanceInfo.totalEarned,
      },
      recentCommissions: history,
      recentWithdraws,
    });
  } catch (error: any) {
    console.error('getAffiliateStats error:', error);
    res.status(500).json({ error: 'Gagal mengambil data statistik affiliator' });
  }
};

export const checkMitraEligibility = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        
        // Cari child yang sudah menjadi affiliator (roleId = 2)
        const eligibleChild = await User.findOne({
            where: {
                parentId: userId,
                roleId: 2 
            }
        });

        // Cek apakah user (parent) sudah melakukan tes sendiri
        const hasThinkingStyleResult = await ThinkingStyleResult.findOne({ where: { userId } });
        const hasDiscResult = await DiscResult.findOne({ where: { user_id: userId } });
        const hasCompletedTest = !!hasThinkingStyleResult || !!hasDiscResult;

        const isEligible = !!eligibleChild && hasCompletedTest;

        let message = "Not eligible";
        if (isEligible) {
            message = "Eligible for upgrade";
        } else if (eligibleChild && !hasCompletedTest) {
            message = "Anda harus menyelesaikan tes terlebih dahulu.";
        } else if (!eligibleChild) {
            message = "Anda belum memiliki member Affiliator.";
        }

        res.status(200).json({ 
            eligible: isEligible,
            message: message
        });
    } catch (error: any) {
        console.error('checkMitraEligibility error:', error);
        res.status(500).json({ error: 'Gagal mengecek eligibility mitra' });
    }
};

export const upgradeToMitra = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        
        // Verifikasi ulang eligibility
        const eligibleChild = await User.findOne({
            where: {
                parentId: userId,
                roleId: 2
            }
        });

        // Cek apakah user (parent) sudah melakukan tes sendiri
        const hasThinkingStyleResult = await ThinkingStyleResult.findOne({ where: { userId } });
        const hasDiscResult = await DiscResult.findOne({ where: { user_id: userId } });
        const hasCompletedTest = !!hasThinkingStyleResult || !!hasDiscResult;

        if (!eligibleChild) {
             res.status(400).json({ message: "Anda belum memenuhi syarat untuk upgrade ke Mitra (Belum memiliki member Affiliator)." });
             return;
        }

        if (!hasCompletedTest) {
             res.status(400).json({ message: "Anda harus menyelesaikan tes (Cognitive Style atau DISC) terlebih dahulu untuk upgrade ke Mitra." });
             return;
        }

        // Upgrade ke Mitra (roleId = 4)
        await User.update({ roleId: 4 }, { where: { id: userId } });
        
        res.status(200).json({ message: "Selamat! Anda telah berhasil upgrade ke Mitra." });
    } catch (error: any) {
        console.error('upgradeToMitra error:', error);
        res.status(500).json({ error: 'Gagal upgrade ke mitra' });
    }
};

// 4. Get detailed balance information
export const getAffiliateBalanceDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const balanceInfo = await getAffiliateBalance(userId);
    
    // Get pending withdraw requests
    const pendingWithdraws = await WithdrawRequest.findAll({
      where: { 
        affiliateId: userId,
        status: ['pending', 'approved']
      },
      order: [['createdAt', 'DESC']],
    });

    const pendingAmount = pendingWithdraws.reduce((sum, withdraw) => sum + withdraw.amount, 0);

    res.status(200).json({
      ...balanceInfo,
      pendingWithdraws,
      pendingAmount,
      effectiveAvailableBalance: balanceInfo.availableBalance - pendingAmount,
    });
  } catch (error: any) {
    console.error('getAffiliateBalanceDetail error:', error);
    res.status(500).json({ error: 'Gagal mengambil detail balance affiliator' });
  }
};

// 5. Get commission breakdown by source
export const getCommissionBreakdown = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Commission from test completions
    const testCommissions = await AffiliateCommission.findAll({
      where: { 
        referrerId: userId,
        source: 'test_completion'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      raw: true
    }) as any[];

    // Commission from token purchases
    const tokenCommissions = await AffiliateCommission.findAll({
      where: { 
        referrerId: userId,
        source: 'token_purchase'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      raw: true
    }) as any[];

    res.status(200).json({
      testCompletions: {
        count: parseInt(testCommissions[0]?.count || '0'),
        totalAmount: parseFloat(testCommissions[0]?.totalAmount || '0')
      },
      tokenPurchases: {
        count: parseInt(tokenCommissions[0]?.count || '0'),
        totalAmount: parseFloat(tokenCommissions[0]?.totalAmount || '0')
      }
    });
  } catch (error: any) {
    console.error('getCommissionBreakdown error:', error);
    res.status(500).json({ error: 'Gagal mengambil breakdown komisi' });
  }
};
