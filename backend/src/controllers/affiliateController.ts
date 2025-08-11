import { Response } from 'express';
import AffiliateCommission from '../models/AffiliateCommission';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

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
    const { userId, referrerId } = req.body;

    if (!userId || typeof userId !== 'number') {
      res.status(400).json({ message: 'userId wajib dikirim dan berupa number' });
      return;
    }

    if (!referrerId) {
      res.status(200).json({ message: 'Tidak ada referral, komisi tidak ditambahkan' });
      return;
    }

    const commission = await AffiliateCommission.create({
      referrerId,
      referredUserId: userId,
      testCompleted: true,
      amount: 10000,
    });

    res.status(201).json({ message: 'Komisi berhasil ditambahkan', commission });
  } catch (error: any) {
    console.error('addCommissionOnTestComplete error:', error);
    res.status(500).json({ error: 'Gagal menambahkan komisi' });
  }
};

// 3. Statistik affiliator
export const getAffiliateStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const totalTests = await AffiliateCommission.count({
      where: { referrerId: userId, testCompleted: true },
    });

    const totalCommission = await AffiliateCommission.sum('amount', {
      where: { referrerId: userId },
    });

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
    });

    res.status(200).json({
      totalTests,
      totalCommission: totalCommission || 0,
      history,
    });
  } catch (error: any) {
    console.error('getAffiliateStats error:', error);
    res.status(500).json({ error: 'Gagal mengambil data statistik affiliator' });
  }
};
