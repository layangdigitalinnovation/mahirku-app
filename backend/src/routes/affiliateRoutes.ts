// src/routes/affiliateRoutes.ts
import { Router } from 'express';
import { 
  getReferralLink, 
  getAffiliateStats,
  getAffiliateBalanceDetail,
  getCommissionBreakdown,
  checkMitraEligibility,
  upgradeToMitra
} from '../controllers/affiliateController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Mendapatkan link referral (hanya untuk user yang login)
router.get('/referral-link', authMiddleware, getReferralLink);

// Mendapatkan statistik affiliate (hanya untuk user yang login)
router.get('/stats', authMiddleware, getAffiliateStats);

// Cek eligibility upgrade mitra
router.get('/check-mitra-eligibility', authMiddleware, checkMitraEligibility);

// Upgrade ke mitra
router.post('/upgrade-mitra', authMiddleware, upgradeToMitra);

// Mendapatkan detail balance affiliate (hanya untuk user yang login)
router.get('/balance', authMiddleware, getAffiliateBalanceDetail);

// Mendapatkan breakdown komisi berdasarkan source (hanya untuk user yang login)
router.get('/commission-breakdown', authMiddleware, getCommissionBreakdown);

export default router;
