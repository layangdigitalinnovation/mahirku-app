// routes/tokenRoutes.ts
import { Router } from 'express';
import {
  purchaseToken,
  handlePaymentCallback,
  addChildUser,
  getChildrenUsers,
  switchActiveUser,
  transferTokenToChild,
} from '../controllers/tokenController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   POST /api/token/purchase
 * @desc    Buat invoice dan proses pembelian token
 * @access  Protected
 */
router.post('/purchase', authMiddleware, purchaseToken);

/**
 * @route   POST /api/token/payment-callback
 * @desc    Simulasikan callback pembayaran dari payment gateway
 * @access  Public
 */
router.post('/payment-callback', handlePaymentCallback);

/**
 * @route   POST /api/token/add-child
 * @desc    Tambah user anak dari parent user
 * @access  Protected
 */
router.post('/add-child', authMiddleware, addChildUser);

/**
 * @route   GET /api/token/children
 * @desc    Ambil semua user anak dari parent yang sedang login
 * @access  Protected
 */
router.get('/children', authMiddleware, getChildrenUsers);

/**
 * @route   POST /api/token/switch-user
 * @desc    Parent switch ke salah satu user anak
 * @access  Protected
 */
router.post('/switch-user', authMiddleware, switchActiveUser);

/**
 * @route   POST /api/token/transfer-token
 * @desc    Transfer token dari parent ke user anak
 * @access  Protected
 */
router.post('/transfer-token', authMiddleware, transferTokenToChild);

export default router;
