import express from 'express';
import {
  createWithdrawRequest,
  getWithdrawHistory,
  getAllWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
  markAsProcessed,
  getWithdrawRequestDetail,
  getWithdrawStatistics
} from '../controllers/withdrawController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/roleMiddleware';

const router = express.Router();

// Routes untuk affiliator
/**
 * @route POST /api/withdraw/request
 * @desc Membuat permintaan withdraw baru
 * @access Private (Affiliator)
 */
router.post('/request', authMiddleware, createWithdrawRequest);

/**
 * @route GET /api/withdraw/history
 * @desc Mendapatkan riwayat withdraw request untuk affiliator yang login
 * @access Private (Affiliator)
 */
router.get('/history', authMiddleware, getWithdrawHistory);

/**
 * @route GET /api/withdraw/:id
 * @desc Mendapatkan detail withdraw request
 * @access Private (Affiliator/Admin)
 */
router.get('/:id', authMiddleware, getWithdrawRequestDetail);

// Routes untuk admin
/**
 * @route GET /api/withdraw/admin/all
 * @desc Mendapatkan semua withdraw requests (untuk admin)
 * @access Private (Admin)
 */
router.get('/admin/all', authMiddleware, checkRole(1), getAllWithdrawRequests);

/**
 * @route PUT /api/withdraw/admin/:id/approve
 * @desc Approve withdraw request
 * @access Private (Admin)
 */
router.put('/admin/:id/approve', authMiddleware, checkRole(1), approveWithdrawRequest);

/**
 * @route PUT /api/withdraw/admin/:id/reject
 * @desc Reject withdraw request
 * @access Private (Admin)
 */
router.put('/admin/:id/reject', authMiddleware, checkRole(1), rejectWithdrawRequest);

/**
 * @route PUT /api/withdraw/admin/:id/process
 * @desc Mark withdraw request as processed
 * @access Private (Admin)
 */
router.put('/admin/:id/process', authMiddleware, checkRole(1), markAsProcessed);

/**
 * @route GET /api/withdraw/admin/statistics
 * @desc Mendapatkan statistik withdraw untuk dashboard admin
 * @access Private (Admin)
 */
router.get('/admin/statistics', authMiddleware, checkRole(1), getWithdrawStatistics);

export default router;