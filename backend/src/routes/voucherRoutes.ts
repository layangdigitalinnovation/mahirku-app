// routes/voucherRoutes.ts
import { Router } from 'express';
import {
  createVoucher,
  getAllVouchers,
  validateVoucher,
  deleteVoucher,
} from '../controllers/voucherController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/vouchers
 * @desc    Ambil semua voucher
 * @access  Protected (Admin Only)
 */
router.get('/', authMiddleware, getAllVouchers);

/**
 * @route   POST /api/vouchers
 * @desc    Buat voucher baru
 * @access  Protected (Admin Only)
 */
router.post('/', authMiddleware, createVoucher);

/**
 * @route   GET /api/vouchers/validate/:code
 * @desc    Validasi voucher berdasarkan kode
 * @access  Public
 */
router.get('/validate/:code', validateVoucher);

/**
 * @route   DELETE /api/vouchers/:id
 * @desc    Hapus voucher berdasarkan ID
 * @access  Protected (Admin Only)
 */
router.delete('/:id', authMiddleware, deleteVoucher);

export default router;
