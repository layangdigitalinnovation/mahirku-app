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

// ===================================================================
// PENTING: Route dengan parameter dinamis (:id) HARUS di bagian BAWAH
// Route spesifik HARUS di bagian ATAS
// ===================================================================

// Semua routes memerlukan autentikasi dan role admin (SUPER_ADMIN)
router.use(authMiddleware);
router.use(checkRole(1)); // SUPER_ADMIN only

// GET /api/admin/thinking-styles - Get all thinking styles with pagination and search
router.get('/', getAllThinkingStyles);

// GET /api/admin/thinking-styles/stats - Get thinking style statistics
router.get('/stats', getThinkingStyleStats);

// GET /api/admin/thinking-styles/test-stats - Get test count statistics
router.get('/test-stats', getAllCountThinkingStyleTest);

// POST /api/admin/thinking-styles - Create new thinking style
router.post('/', createThinkingStyle);

// POST /api/admin/thinking-styles/bulk-update - Bulk update thinking styles
router.post('/bulk-update', bulkUpdateThinkingStyles);

// ===================================================================
// Routes dengan parameter dinamis (:id) - HARUS DI BAGIAN BAWAH
// ===================================================================

// GET /api/admin/thinking-styles/:id - Get thinking style by ID
router.get('/:id', getThinkingStyleById);

// PUT /api/admin/thinking-styles/:id - Update thinking style
router.put('/:id', updateThinkingStyle);

// DELETE /api/admin/thinking-styles/:id - Soft delete thinking style
router.delete('/:id', deleteThinkingStyle);

export default router;