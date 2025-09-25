import { Router } from 'express';
import { getDashboardStatistics, getRealtimeStats } from '../controllers/dashboardController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/roleMiddleware';

const router = Router();

// Semua routes memerlukan autentikasi dan role admin (SUPER_ADMIN)
router.use(authMiddleware);
router.use(checkRole(1)); // SUPER_ADMIN only

/**
 * @route   GET /api/dashboard/statistics
 * @desc    Get comprehensive dashboard statistics
 * @access  Protected - Admin only
 * @query   startDate, endDate (optional) - Filter by date range
 */
router.get('/statistics', getDashboardStatistics);

/**
 * @route   GET /api/dashboard/realtime
 * @desc    Get real-time dashboard statistics
 * @access  Protected - Admin only
 */
router.get('/realtime', getRealtimeStats);

export default router;