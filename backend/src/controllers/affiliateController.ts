import { Response } from 'express';
import AffiliateCommission from '../models/AffiliateCommission';
import AffiliateBalance from '../models/AffiliateBalance';
import WithdrawRequest from '../models/WithdrawRequest';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';
import { getAffiliateBalance, addTestCompletionCommission } from '../utils/affiliateUtils';
import { sequelize } from '../config/database';

// 1. Generate referral link
export const getReferralLink = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const referralCode = `aff${userId}`;
    const link = `https://mahirku.com/?ref=${referralCode}`;
    res.status(200).json({ referralLink: link });
  } catch (error: any) {
    console.error('getReferralLink error:', error);
    res.status(500).json({ error: 'Gagal membuat link referral' });
  }
};

// 2. Catat komisi saat tes selesai
export const addCommissionOnTestComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, referrerId, testId } = req.body;

    if (!userId || typeof userId !== 'number') {
      res.status(400).json({ message: 'userId wajib dikirim dan berupa number' });
      return;
    }

    if (!referrerId) {
      res.status(200).json({ message: 'Tidak ada referral, komisi tidak ditambahkan' });
      return;
    }

    // Gunakan utility function yang baru
    const commission = await addTestCompletionCommission(referrerId, userId, testId);

    res.status(201).json({ message: 'Komisi berhasil ditambahkan', commission });
  } catch (error: any) {
    console.error('addCommissionOnTestComplete error:', error);
    res.status(500).json({ error: 'Gagal menambahkan komisi' });
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
