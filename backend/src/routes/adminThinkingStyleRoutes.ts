import { Router } from 'express';
import {
  getAllThinkingStyles,
  getThinkingStyleById,
  createThinkingStyle,
  updateThinkingStyle,
  deleteThinkingStyle,
  restoreThinkingStyle,
  getThinkingStyleStats,
  bulkUpdateThinkingStyles,
  getAllCountThinkingStyleTest
} from '../controllers/adminThinkingStyleController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/roleMiddleware';

const router = Router();

// Semua routes memerlukan autentikasi dan role admin (SUPER_ADMIN)
router.use(authMiddleware);
router.use(checkRole(1)); // SUPER_ADMIN only

// GET /api/admin/thinking-styles - Get all thinking styles with pagination and search
router.get('/', getAllThinkingStyles);

// GET /api/admin/thinking-styles/stats - Get thinking style statistics
router.get('/stats', getThinkingStyleStats);
router.get('/test-stats', getAllCountThinkingStyleTest);

// GET /api/admin/thinking-styles/:id - Get thinking style by ID
router.get('/:id', getThinkingStyleById);

// POST /api/admin/thinking-styles - Create new thinking style
router.post('/', createThinkingStyle);

// PUT /api/admin/thinking-styles/:id - Update thinking style
router.put('/:id', updateThinkingStyle);

// DELETE /api/admin/thinking-styles/:id - Soft delete thinking style
router.delete('/:id', deleteThinkingStyle);

// PATCH /api/admin/thinking-styles/:id/restore - Restore thinking style
router.patch('/:id/restore', restoreThinkingStyle);

// POST /api/admin/thinking-styles/bulk-update - Bulk update thinking styles
router.post('/bulk-update', bulkUpdateThinkingStyles);


export default router;