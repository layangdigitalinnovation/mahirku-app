// routes/paymentRoutes.ts
import { Router } from 'express';
import {
  xenditPayment,
  handlePaymentCallback,
} from '../controllers/xenditController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   POST /api/payment/xendit
 * @desc    Memulai proses pembayaran dengan Xendit
 * @access  Protected
 */
router.post('/xendit', authMiddleware, xenditPayment);
  /**
 * @route   POST /api/payment/xendit/callback
 * @desc    Callback dari Xendit untuk update status pembayaran
 * @access  Public (Xendit tidak mengirim token auth)
 */
router.post('/xendit/callback', handlePaymentCallback);

export default router;
