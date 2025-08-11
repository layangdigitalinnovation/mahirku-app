// src/routes/affiliateRoutes.ts
import { Router } from 'express';
import { getReferralLink, addCommissionOnTestComplete, getAffiliateStats } from '../controllers/affiliateController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Mendapatkan link referral (hanya untuk user yang login)
router.get('/referral-link', authMiddleware, getReferralLink);

// Menambahkan komisi ketika tes selesai
router.post('/add-commission', authMiddleware, addCommissionOnTestComplete);

// Mendapatkan statistik affiliate (hanya untuk user yang login)
router.get('/stats', authMiddleware, getAffiliateStats);

export default router;
