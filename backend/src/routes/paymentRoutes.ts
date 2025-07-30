// routes/paymentRoutes.ts
import { Router } from 'express';
import {
  startDuitkuPayment,
  handlePaymentCallback,
} from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   POST /api/payment/start
 * @desc    Memulai proses pembayaran dengan Duitku
 * @access  Protected
 */
router.post('/start', authMiddleware, startDuitkuPayment);

/**
 * @route   POST /api/payment/payment-callback
 * @desc    Callback dari Duitku untuk update status pembayaran
 * @access  Public (Duitku tidak mengirim token auth)
 */
router.post('/payment-callback', handlePaymentCallback);

export default router;
